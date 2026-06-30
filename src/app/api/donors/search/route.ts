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
  const query = searchParams.get("query");

  if (!query) {
    return NextResponse.json({ error: "Search query is required" }, { status: 400 });
  }

  try {
    const donor = await prisma.donorProfile.findFirst({
      where: {
        OR: [
          { user: { email: { equals: query.trim(), mode: "insensitive" } } },
          { phone: { equals: query.trim() } },
        ],
      },
    });

    if (!donor) {
      return NextResponse.json({ donor: null });
    }

    return NextResponse.json({ donor });
  } catch (error: any) {
    console.error("Search API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
