import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST() {
  try {
    // Find overdue invoices
    const overdueInvoices = await prisma.invoice.findMany({
      where: {
        status: "Overdue",
      },
    });

    let draftedCount = 0;

    for (const inv of overdueInvoices) {
      // Find matching conversation by customer name
      const conversation = await prisma.conversation.findFirst({
        where: {
          customerName: {
            contains: inv.customer,
          },
        },
      });

      if (conversation) {
        // Increment reminder count
        await prisma.invoice.update({
          where: { id: inv.id },
          data: {
            remindersSent: inv.remindersSent + 1,
          },
        });

        // Draft message text based on reminder count
        let tone = "friendly";
        let messageText = `Dear ${inv.customer}, friendly reminder that payment for Invoice ${inv.id} (₹${inv.amount.toLocaleString("en-IN")}) is due. Please settle using link: pay.dukanmitra.in/inv-${inv.id.replace("#", "")} (Draft)`;
        
        if (inv.remindersSent === 1) {
          tone = "firm";
          messageText = `Dear ${inv.customer}, Invoice ${inv.id} is outstanding by ${inv.overdueDays} days. Kindly complete payment today: pay.dukanmitra.in/inv-${inv.id.replace("#", "")} (Draft)`;
        } else if (inv.remindersSent >= 2) {
          tone = "urgent";
          messageText = `URGENT: Outstanding payment of ₹${inv.amount.toLocaleString("en-IN")} for Invoice ${inv.id} remains unpaid. Please settle immediately to avoid collection action: pay.dukanmitra.in/inv-${inv.id.replace("#", "")} (Draft)`;
        }

        // Add message to conversation transcript
        await prisma.message.create({
          data: {
            conversationId: conversation.id,
            sender: "ai",
            text: messageText,
            time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
          },
        });

        // Update last message header
        await prisma.conversation.update({
          where: { id: conversation.id },
          data: {
            lastMessage: messageText,
            intent: "PAYMENT_REMINDER",
            agent: "Recovery Agent",
          },
        });

        // Add to feed log
        await prisma.feedItem.create({
          data: {
            time: "NOW",
            agent: "Recovery Agent",
            text: `drafted ${tone} overdue reminder for ${inv.customer}.`,
            icon: "chat",
            iconBg: "bg-tertiary-fixed text-on-tertiary-fixed-variant",
            iconColor: "text-tertiary",
          },
        });

        draftedCount++;
      }
    }

    return NextResponse.json({ success: true, processedCount: overdueInvoices.length, draftedCount });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
