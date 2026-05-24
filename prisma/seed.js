const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Clean old data
  await prisma.feedItem.deleteMany();
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.product.deleteMany();

  // Seed Products
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

  // Seed Invoices
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

  // Seed Conversations & Messages
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

  // Seed FeedItems
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

  console.log("Seeding complete!");
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
