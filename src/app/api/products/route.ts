import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const products = await prisma.product.findMany();
    return NextResponse.json(products);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, name, stock, threshold, status, demandPrediction, category, stockText, coverageDays, statusColor } = body;

    const product = await prisma.product.upsert({
      where: { id },
      update: { name, stock, threshold, status, demandPrediction, category, stockText, coverageDays, statusColor },
      create: { id, name, stock, threshold, status, demandPrediction, category, stockText, coverageDays, statusColor },
    });

    return NextResponse.json(product);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
