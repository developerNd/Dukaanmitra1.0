import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { command, agent } = body;

    if (!command) {
      return NextResponse.json({ error: "Command description is required" }, { status: 400 });
    }

    // Add activity log
    const feedItem = await prisma.feedItem.create({
      data: {
        time: "JUST NOW",
        agent: agent || "AI Dispatcher",
        text: `received custom instruction: "${command}" and initiated task.`,
        icon: "auto_awesome",
        iconBg: "bg-primary-container text-white",
        iconColor: "text-secondary",
      },
    });

    return NextResponse.json({ success: true, feedItem });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
