import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const feed = await prisma.feedItem.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
    return NextResponse.json(feed);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { time, agent, text, icon, iconBg, iconColor } = body;

    const feedItem = await prisma.feedItem.create({
      data: {
        time: time || "NOW",
        agent,
        text,
        icon,
        iconBg,
        iconColor,
      },
    });

    return NextResponse.json(feedItem);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
