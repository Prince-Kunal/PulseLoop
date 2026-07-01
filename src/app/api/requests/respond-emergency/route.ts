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
    const { notificationId, donorId, response } = body;

    if (!notificationId || !donorId || !response) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (response !== "AVAILABLE" && response !== "UNAVAILABLE") {
      return NextResponse.json({ error: "Invalid response action" }, { status: 400 });
    }

    // Fetch notification to confirm it exists and belongs to the donor
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification || notification.donorId !== donorId) {
      return NextResponse.json({ error: "Notification not found or unauthorized" }, { status: 404 });
    }

    // Run transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create EmergencyResponse record
      const emergencyResponse = await tx.emergencyResponse.create({
        data: {
          notificationId,
          donorId,
          response,
        },
      });

      // 2. Update Notification status to RESPONDED
      await tx.notification.update({
        where: { id: notificationId },
        data: {
          status: "RESPONDED",
        },
      });

      // 3. Update Donor's last active timestamp
      await tx.donorProfile.update({
        where: { id: donorId },
        data: {
          lastActiveAt: new Date(),
        },
      });

      // 4. Log timeline event if accepted
      if (response === "AVAILABLE") {
        const donor = await tx.donorProfile.findUnique({
          where: { id: donorId },
        });

        await tx.requestTimeline.create({
          data: {
            bloodRequestId: notification.bloodRequestId,
            event: "DONOR_ACCEPTED",
          },
        });
      }

      return emergencyResponse;
    });

    return NextResponse.json({ success: true, response: result });
  } catch (error: any) {
    console.error("Submit Donor Emergency Response Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
