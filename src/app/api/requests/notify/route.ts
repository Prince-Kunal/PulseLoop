import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { requestId, donorIds } = body;

    if (!requestId || !donorIds || !Array.isArray(donorIds) || donorIds.length === 0) {
      return NextResponse.json({ error: "Request ID and a non-empty donorIds array are required" }, { status: 400 });
    }

    // 1. Fetch request details to get hospitalName
    const requestRecord = await prisma.bloodRequest.findUnique({
      where: { id: requestId },
      include: {
        hospital: {
          select: {
            id: true,
            hospitalName: true,
          },
        },
      },
    });

    if (!requestRecord) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    // 2. Create Notification records
    await prisma.notification.createMany({
      data: donorIds.map((donorId: string) => ({
        donorId,
        bloodRequestId: requestId,
        hospitalId: requestRecord.hospitalId,
        title: "Emergency Blood Request Alert",
        message: `${requestRecord.hospital.hospitalName} urgently requires ${requestRecord.unitsRequired} units of ${requestRecord.bloodGroup}. You have been prioritized based on your eligibility, location, and donation history. Please respond as soon as possible.`,
        status: "SENT",
      })),
    });

    // 3. Log "NOTIFICATIONS_SENT" timeline event
    const existingEvent = await prisma.requestTimeline.findFirst({
      where: {
        bloodRequestId: requestId,
        event: "NOTIFICATIONS_SENT",
      },
    });

    if (!existingEvent) {
      await prisma.requestTimeline.create({
        data: {
          bloodRequestId: requestId,
          event: "NOTIFICATIONS_SENT",
        },
      });
    }

    return NextResponse.json({ success: true, count: donorIds.length });
  } catch (error: any) {
    console.error("Send Emergency Notifications API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
