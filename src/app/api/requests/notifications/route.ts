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
  const donorId = searchParams.get("donorId");

  if (!donorId) {
    return NextResponse.json({ error: "Donor ID is required" }, { status: 400 });
  }

  try {
    // Fetch notifications where blood request is active (PENDING or ACCEPTED or IN_PROGRESS)
    const notifications = await prisma.notification.findMany({
      where: {
        donorId,
        status: "SENT",
        bloodRequest: {
          status: {
            in: ["PENDING", "ACCEPTED", "IN_PROGRESS"],
          },
        },
      },
      include: {
        bloodRequest: {
          select: {
            id: true,
            bloodGroup: true,
            unitsRequired: true,
            urgency: true,
            createdAt: true,
          },
        },
        hospital: {
          select: {
            id: true,
            hospitalName: true,
            latitude: true,
            longitude: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ notifications });
  } catch (error: any) {
    console.error("Fetch Donor Notifications API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
