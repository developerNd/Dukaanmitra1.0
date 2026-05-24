import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { chatId, text } = body;

    if (!chatId || !text) {
      return NextResponse.json({ error: "chatId and approved text are required" }, { status: 400 });
    }

    // Find parent conversation
    const conversation = await prisma.conversation.findUnique({
      where: { id: chatId },
    });

    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    // Find the last draft message
    const messages = await prisma.message.findMany({
      where: { conversationId: chatId },
    });

    const draftMessage = messages.find(m => m.text.includes("(Draft)"));

    if (draftMessage) {
      // Update draft message
      await prisma.message.update({
        where: { id: draftMessage.id },
        data: {
          text: text,
          time: "Just Now (Approved)",
        },
      });
    } else {
      // If no draft, append a new message
      await prisma.message.create({
        data: {
          conversationId: chatId,
          sender: "ai",
          text: text,
          time: "Just Now",
        },
      });
    }

    // Update parent conversation header lastMessage
    await prisma.conversation.update({
      where: { id: chatId },
      data: { lastMessage: text },
    });

    // Add activity log
    await prisma.feedItem.create({
      data: {
        time: "JUST NOW",
        agent: conversation.agent,
        text: `sent approved message to ${conversation.customerName}.`,
        icon: "done",
        iconBg: "bg-secondary-container text-on-secondary-container",
        iconColor: "text-secondary",
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
