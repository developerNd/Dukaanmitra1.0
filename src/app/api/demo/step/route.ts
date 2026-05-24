import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Helper to run seed logic on reset
async function resetDb() {
  await prisma.feedItem.deleteMany();
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.product.deleteMany();

  // Products
  await prisma.product.createMany({
    data: [
      {
        id: "P-1",
        name: "Wireless Headphones Pro",
        stock: 245,
        threshold: 50,
        status: "Normal",
        demandPrediction: "Stable demand (approx. 30 units/week)",
        category: "Electronics / Audio",
        stockText: "245 / 300",
        coverageDays: 18,
        statusColor: "bg-secondary",
      },
      {
        id: "P-2",
        name: "Organic Almond Milk",
        stock: 14,
        threshold: 30,
        status: "Low Stock",
        demandPrediction: "CRITICAL: Stockout predicted in 2 days",
        category: "Groceries / Health",
        stockText: "14 / 120",
        coverageDays: 2,
        statusColor: "bg-error",
      },
      {
        id: "P-3",
        name: "Smart Watch Series 5",
        stock: 32,
        threshold: 15,
        status: "Normal",
        demandPrediction: "Moderate velocity (approx. 10 units/week)",
        category: "Wearables",
        stockText: "32 / 70",
        coverageDays: 11,
        statusColor: "bg-secondary",
      },
      {
        id: "P-4",
        name: "AA Battery Pack",
        stock: 150,
        threshold: 50,
        status: "Normal",
        demandPrediction: "Stable demand",
        category: "Essentials",
        stockText: "150 / 200",
        coverageDays: 30,
        statusColor: "bg-secondary",
      }
    ],
  });

  // Invoices
  await prisma.invoice.createMany({
    data: [
      {
        id: "#INV-8821",
        customer: "Blue Ocean Logistics",
        amount: 1200.0,
        dueDate: "Overdue (2d)",
        overdueDays: 2,
        status: "Overdue",
        remindersSent: 0,
        actionText: "Sending nudge in 2h",
        actionType: "pulse_teal",
        statusColor: "text-error",
      },
      {
        id: "#INV-8819",
        customer: "Crafted Comforts",
        amount: 450.0,
        dueDate: "Due Tomorrow",
        overdueDays: 0,
        status: "Due Tomorrow",
        remindersSent: 0,
        actionText: "Auto-followup scheduled",
        actionType: "schedule",
        statusColor: "text-on-surface-variant",
      },
      {
        id: "#INV-8815",
        customer: "Starlight Events",
        amount: 3150.0,
        dueDate: "Paid",
        overdueDays: 0,
        status: "Paid",
        remindersSent: 0,
        actionText: "AI Thank-you sent",
        actionType: "check_circle",
        statusColor: "text-secondary",
      },
    ],
  });

  // Conversations & Messages
  const chat1 = await prisma.conversation.create({
    data: {
      id: "chat-1",
      customerName: "Ramesh Kumar",
      phone: "+91 99880 12345",
      lastMessage: "Interested in the catalog shared last week.",
      intent: "ORDER_QUERY",
      agent: "Sales Agent",
    },
  });

  await prisma.message.createMany({
    data: [
      {
        conversationId: chat1.id,
        sender: "customer",
        text: "Hello, interested in the catalog shared last week.",
        time: "Yesterday",
      },
      {
        conversationId: chat1.id,
        sender: "ai",
        text: "Hello Ramesh! Sure, I can assist you with orders or pricing questions. Let me know what you need.",
        time: "Yesterday",
      },
    ],
  });

  const chat2 = await prisma.conversation.create({
    data: {
      id: "chat-2",
      customerName: "Anita Textiles",
      phone: "+91 76543 09871",
      lastMessage: "I want to negotiate the price for 500 units.",
      intent: "NEGOTIATION",
      agent: "Sales Agent",
    },
  });

  await prisma.message.createMany({
    data: [
      {
        conversationId: chat2.id,
        sender: "customer",
        text: "We need 500 spools of premium yarn. What's the best price you can offer?",
        time: "11:15 AM",
      },
      {
        conversationId: chat2.id,
        sender: "ai",
        text: "For 500 spools, we can offer a wholesale discount of 10%, making it ₹180 per spool.",
        time: "11:16 AM",
      },
      {
        conversationId: chat2.id,
        sender: "customer",
        text: "I want to negotiate the price for 500 units. Can we do ₹160?",
        time: "11:18 AM",
      },
      {
        conversationId: chat2.id,
        sender: "ai",
        text: "Let me check with my pricing guidelines. I can offer ₹170 if we finalize the invoice today. (Draft)",
        time: "11:19 AM",
      },
    ],
  });

  const chat3 = await prisma.conversation.create({
    data: {
      id: "chat-3",
      customerName: "Sanjay Gupta (Gupta Retailers)",
      phone: "+91 88776 65544",
      lastMessage: "Please give me 2 more days to settle the invoice.",
      intent: "PAYMENT_REMINDER",
      agent: "Recovery Agent",
    },
  });

  await prisma.message.createMany({
    data: [
      {
        conversationId: chat3.id,
        sender: "ai",
        text: "Hi Sanjay, this is the automated recovery assistant from DukanMitra. Friendly reminder that Invoice #INV-1024 (₹15,000) was due 5 days ago.",
        time: "9:00 AM",
      },
      {
        conversationId: chat3.id,
        sender: "customer",
        text: "I am facing some cash flow issues this week. Please give me 2 more days to settle the invoice.",
        time: "9:05 AM",
      },
      {
        conversationId: chat3.id,
        sender: "ai",
        text: "Understood, Sanjay. I can temporarily extend your payment due date to May 26th without any late fees. Does that work for you? (Draft)",
        time: "9:06 AM",
      },
    ],
  });

  // FeedItems
  await prisma.feedItem.createMany({
    data: [
      {
        time: "NOW",
        agent: "Sales Agent",
        text: "sent a product catalog to +91-XXXXX.",
        icon: "send",
        iconBg: "bg-secondary-container text-on-secondary-container",
        iconColor: "text-secondary",
      },
      {
        time: "2 MIN AGO",
        agent: "Recovery Agent",
        text: "updated invoice status for #INV-982.",
        icon: "receipt_long",
        iconBg: "bg-tertiary-fixed text-on-tertiary-fixed-variant",
        iconColor: "text-tertiary",
      },
      {
        time: "15 MIN AGO",
        agent: "Inventory Agent",
        text: "flagged 'Organic Cotton Thread' as low stock.",
        icon: "inventory_2",
        iconBg: "bg-surface-container-high text-on-surface-variant",
        iconColor: "text-on-surface-variant",
      },
      {
        time: "45 MIN AGO",
        agent: "Sales Agent",
        text: "closed order #ORD-441 automatically.",
        icon: "done_all",
        iconBg: "bg-secondary-container text-on-secondary-container",
        iconColor: "text-secondary",
      },
    ],
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { step, reset } = body;

    if (reset) {
      await resetDb();
      return NextResponse.json({ success: true, message: "Database reset to seed data" });
    }

    if (typeof step !== "number" || step < 1 || step > 8) {
      return NextResponse.json({ error: "Invalid step number" }, { status: 400 });
    }

    switch (step) {
      case 1: // Customer sends "Need 20 office chairs"
        await prisma.message.create({
          data: {
            conversationId: "chat-1",
            sender: "customer",
            text: "Need 20 office chairs",
            time: "Just Now",
          },
        });
        await prisma.conversation.update({
          where: { id: "chat-1" },
          data: { lastMessage: "Need 20 office chairs" },
        });
        await prisma.feedItem.create({
          data: {
            time: "JUST NOW",
            agent: "Sales Agent",
            text: "received request for bulk chairs from Ramesh Kumar.",
            icon: "mail",
            iconBg: "bg-secondary-container text-on-secondary-container",
            iconColor: "text-secondary",
          },
        });
        break;

      case 2: // Sales AI responds within 3 seconds
        await prisma.message.create({
          data: {
            conversationId: "chat-1",
            sender: "ai",
            text: "Hi Ramesh! We have the Executive Pro Chair in stock at ₹3,200 each. For 20 units, the total is ₹64,000. Shall I generate a formal quotation for you? (Draft)",
            time: "3s ago",
          },
        });
        await prisma.conversation.update({
          where: { id: "chat-1" },
          data: { lastMessage: "Hi! We have the Executive Pro Chair at ₹3,200 each..." },
        });
        await prisma.feedItem.create({
          data: {
            time: "JUST NOW",
            agent: "Sales Agent",
            text: "drafted response offering 20 Executive Pro Chairs for ₹64,000.",
            icon: "psychology",
            iconBg: "bg-primary-container text-white",
            iconColor: "text-secondary",
          },
        });
        break;

      case 3: // Quotation PDF generated and sent automatically
        // Find the draft message and update it
        const messages3 = await prisma.message.findMany({
          where: { conversationId: "chat-1" },
        });
        const draft3 = messages3.find(m => m.text.includes("(Draft)"));
        if (draft3) {
          await prisma.message.update({
            where: { id: draft3.id },
            data: {
              text: "Hi Ramesh! We have the Executive Pro Chair in stock at ₹3,200 each. For 20 units, the total is ₹64,000. Under pricing guidelines, I have generated and attached your formal Quotation #QTN-8821.pdf.",
              time: "1m ago",
            },
          });
        }
        await prisma.conversation.update({
          where: { id: "chat-1" },
          data: { lastMessage: "Attached Quotation #QTN-8821.pdf" },
        });
        await prisma.feedItem.create({
          data: {
            time: "JUST NOW",
            agent: "Sales Agent",
            text: "generated and transmitted Quotation #QTN-8821 (₹64,000).",
            icon: "picture_as_pdf",
            iconBg: "bg-secondary-container text-on-secondary-container",
            iconColor: "text-secondary",
          },
        });
        break;

      case 4: // Invoice created, payment link shared
        await prisma.message.create({
          data: {
            conversationId: "chat-1",
            sender: "ai",
            text: "Thank you for confirming the order! I have processed it. Here is your Invoice #INV-8822 and the secure payment gateway link: pay.dukanmitra.in/inv-8822",
            time: "Just Now",
          },
        });
        await prisma.conversation.update({
          where: { id: "chat-1" },
          data: { lastMessage: "Invoice #INV-8822 created. Payment link: pay.dukanmitra.in/inv-8822" },
        });
        await prisma.invoice.create({
          data: {
            id: "#INV-8822",
            customer: "Ramesh Kumar",
            amount: 64000.0,
            dueDate: "Due in 5d",
            overdueDays: 0,
            status: "Due Tomorrow", // mapping to intermediate due status
            remindersSent: 0,
            actionText: "Auto-followup scheduled",
            actionType: "schedule",
            statusColor: "text-on-surface-variant",
          },
        });
        await prisma.feedItem.create({
          data: {
            time: "JUST NOW",
            agent: "Recovery Agent",
            text: "created Invoice #INV-8822 for Ramesh Kumar (₹64,000) and initialized payment tracker.",
            icon: "receipt_long",
            iconBg: "bg-tertiary-fixed text-on-tertiary-fixed-variant",
            iconColor: "text-tertiary",
          },
        });
        break;

      case 5: // Payment not received after 5 days (aging simulation)
        await prisma.invoice.update({
          where: { id: "#INV-8822" },
          data: {
            status: "Overdue",
            dueDate: "Overdue (5d)",
            overdueDays: 5,
            statusColor: "text-error",
            actionText: "Send Escalation",
            actionType: "pulse_teal",
          },
        });
        await prisma.feedItem.create({
          data: {
            time: "JUST NOW",
            agent: "Recovery Agent",
            text: "flagged Invoice #INV-8822 as 5-days overdue. Triggering reminder loop.",
            icon: "warning",
            iconBg: "bg-error-container text-on-error-container",
            iconColor: "text-error",
          },
        });
        break;

      case 6: // Recovery AI sends polite reminder
        await prisma.message.create({
          data: {
            conversationId: "chat-1",
            sender: "ai",
            text: "Dear Ramesh, friendly reminder that payment for Invoice #INV-8822 (₹64,000) is due. Please settle using the link: pay.dukanmitra.in/inv-8822 (Draft)",
            time: "Just Now",
          },
        });
        await prisma.conversation.update({
          where: { id: "chat-1" },
          data: {
            lastMessage: "Dear Ramesh, friendly reminder that payment for Invoice #INV-8822...",
            intent: "PAYMENT_REMINDER",
            agent: "Recovery Agent",
          },
        });
        await prisma.invoice.update({
          where: { id: "#INV-8822" },
          data: { remindersSent: 1 },
        });
        await prisma.feedItem.create({
          data: {
            time: "JUST NOW",
            agent: "Recovery Agent",
            text: "drafted friendly overdue reminder for Ramesh Kumar.",
            icon: "chat",
            iconBg: "bg-tertiary-fixed text-on-tertiary-fixed-variant",
            iconColor: "text-tertiary",
          },
        });
        break;

      case 7: // Inventory AI detects low stock
        await prisma.product.create({
          data: {
            id: "P-5",
            name: "Executive Pro Chair",
            stock: 12,
            threshold: 20,
            status: "Low Stock",
            demandPrediction: "CRITICAL: Shortage predicted in 3 days due to bulk sales spike",
            category: "Furniture / Office",
            stockText: "12 / 100",
            coverageDays: 3,
            statusColor: "bg-error",
          },
        });
        await prisma.feedItem.create({
          data: {
            time: "JUST NOW",
            agent: "Inventory Agent",
            text: "alerted critical low stock of Executive Pro Chair (12 remaining).",
            icon: "warning",
            iconBg: "bg-error-container text-on-error-container",
            iconColor: "text-error",
          },
        });
        break;

      case 8: // Suggested reorder generated
        await prisma.feedItem.create({
          data: {
            time: "JUST NOW",
            agent: "Inventory Agent",
            text: "recommended restock of 50 Executive Pro Chairs from Supreme Furniture Ltd.",
            icon: "auto_awesome",
            iconBg: "bg-secondary-container text-on-secondary-container",
            iconColor: "text-secondary",
          },
        });
        break;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
