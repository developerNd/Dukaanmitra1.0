import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const conversations = await prisma.conversation.findMany({
      include: {
        messages: true,
      },
    });
    return NextResponse.json(conversations);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Check if we are adding a single message to an existing conversation
    if (body.conversationId && body.sender && body.text) {
      const message = await prisma.message.create({
        data: {
          conversationId: body.conversationId,
          sender: body.sender,
          text: body.text,
          time: body.time || new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
        },
      });

      // Update the last message in the parent conversation
      await prisma.conversation.update({
        where: { id: body.conversationId },
        data: { lastMessage: body.text },
      });

      return NextResponse.json(message);
    }

    const { id, customerName, phone, lastMessage, intent, agent, messages } = body;

    const conversation = await prisma.conversation.upsert({
      where: { id },
      update: { customerName, phone, lastMessage, intent, agent },
      create: {
        id,
        customerName,
        phone,
        lastMessage,
        intent,
        agent,
        messages: messages ? {
          create: messages.map((m: any) => ({
            sender: m.sender,
            text: m.text,
            time: m.time,
          })),
        } : undefined,
      },
      include: {
        messages: true,
      },
    });

    return NextResponse.json(conversation);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
