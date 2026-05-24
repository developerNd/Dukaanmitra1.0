import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session_token")?.value;

    if (token) {
      // Delete session from DB
      await prisma.session.delete({
        where: { id: token },
      }).catch(() => {}); // Ignore if already deleted
    }

    // Clear cookie
    cookieStore.delete("session_token");

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
