import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const requestId = searchParams.get("requestId");

  if (!requestId) {
    return NextResponse.json({ error: "Request ID is required" }, { status: 400 });
  }

  try {
    const timeline = await prisma.requestTimeline.findMany({
      where: { bloodRequestId: requestId },
      orderBy: { timestamp: "asc" },
    });

    return NextResponse.json({ success: true, timeline });
  } catch (error: any) {
    console.error("Fetch Request Timeline API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
