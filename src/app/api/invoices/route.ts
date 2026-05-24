import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const invoices = await prisma.invoice.findMany();
    return NextResponse.json(invoices);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, customer, amount, dueDate, overdueDays, status, remindersSent, actionText, actionType, statusColor } = body;

    const invoice = await prisma.invoice.upsert({
      where: { id },
      update: { customer, amount, dueDate, overdueDays, status, remindersSent, actionText, actionType, statusColor },
      create: { id, customer, amount, dueDate, overdueDays, status, remindersSent, actionText, actionType, statusColor },
    });

    return NextResponse.json(invoice);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
