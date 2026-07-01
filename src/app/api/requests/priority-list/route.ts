import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PriorityScoringService } from "@/services/priorityScoringService";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const requestId = searchParams.get("requestId");
  const bloodBankId = searchParams.get("bloodBankId");

  if (!requestId || !bloodBankId) {
    return NextResponse.json({ error: "Request ID and Blood Bank ID are required" }, { status: 400 });
  }

  try {
    // 1. Fetch request details
    const requestRecord = await prisma.bloodRequest.findUnique({
      where: { id: requestId },
    });

    if (!requestRecord) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    // 2. Fetch blood bank profile
    const bloodBankProfile = await prisma.bloodBankProfile.findUnique({
      where: { id: bloodBankId },
    });

    if (!bloodBankProfile) {
      return NextResponse.json({ error: "Blood Bank not found" }, { status: 404 });
    }

    // 3. Fetch matching donors
    const donors = await prisma.donorProfile.findMany({
      where: {
        bloodGroup: requestRecord.bloodGroup,
      },
      include: {
        responses: {
          select: {
            response: true,
          },
        },
      },
    });

    // 4. Rank donors using the prioritization service
    const rankedDonors = PriorityScoringService.rankDonors({
      request: {
        bloodGroup: requestRecord.bloodGroup,
        unitsRequired: requestRecord.unitsRequired,
        urgency: requestRecord.urgency,
      },
      bloodBank: {
        latitude: bloodBankProfile.latitude,
        longitude: bloodBankProfile.longitude,
      },
      donors: donors as any, // maps to expected fields cleanly
    });

    // 5. Log "PRIORITY_LIST_GENERATED" timeline event if not already present
    const existingEvent = await prisma.requestTimeline.findFirst({
      where: {
        bloodRequestId: requestId,
        event: "PRIORITY_LIST_GENERATED",
      },
    });

    if (!existingEvent) {
      await prisma.requestTimeline.create({
        data: {
          bloodRequestId: requestId,
          event: "PRIORITY_LIST_GENERATED",
        },
      });
    }

    return NextResponse.json({ success: true, donors: rankedDonors });
  } catch (error: any) {
    console.error("Generate Priority List API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
