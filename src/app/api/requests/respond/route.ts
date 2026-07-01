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
    const { requestId, bloodBankId, action } = body;

    if (!requestId || !bloodBankId || !action) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (action !== "ACCEPT" && action !== "REJECT") {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    // Run transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Fetch request details and check PENDING status
      const requestRecord = await tx.bloodRequest.findUnique({
        where: { id: requestId },
      });

      if (!requestRecord) {
        throw new Error("RequestNotFound");
      }

      if (requestRecord.status !== "PENDING") {
        throw new Error("RequestAlreadyProcessed");
      }

      // 2. Handle Accept Action
      if (action === "ACCEPT") {
        const inventory = await tx.inventory.findUnique({
          where: {
            bloodBankId_bloodGroup: {
              bloodBankId,
              bloodGroup: requestRecord.bloodGroup,
            },
          },
        });

        const availableUnits = inventory?.units ?? 0;

        // Check if stock is insufficient
        if (availableUnits < requestRecord.unitsRequired) {
          return {
            success: false,
            error: "INSUFFICIENT_STOCK",
            availableUnits,
            unitsRequired: requestRecord.unitsRequired,
            bloodGroup: requestRecord.bloodGroup,
          };
        }

        // Deduct from inventory
        await tx.inventory.update({
          where: {
            bloodBankId_bloodGroup: {
              bloodBankId,
              bloodGroup: requestRecord.bloodGroup,
            },
          },
          data: {
            units: availableUnits - requestRecord.unitsRequired,
          },
        });

        // Set status to ACCEPTED and assign the blood bank
        const updatedRequest = await tx.bloodRequest.update({
          where: { id: requestId },
          data: {
            status: "ACCEPTED",
            bloodBankId,
          },
        });

        return { success: true, request: updatedRequest };
      }

      // 3. Handle Reject Action
      if (action === "REJECT") {
        const updatedRequest = await tx.bloodRequest.update({
          where: { id: requestId },
          data: {
            status: "REJECTED",
          },
        });

        return { success: true, request: updatedRequest };
      }

      return { success: false, error: "UnknownAction" };
    });

    if (!result.success) {
      if (result.error === "INSUFFICIENT_STOCK") {
        return NextResponse.json(
          {
            error: "INSUFFICIENT_STOCK",
            availableUnits: result.availableUnits,
            unitsRequired: result.unitsRequired,
            bloodGroup: result.bloodGroup,
          },
          { status: 400 }
        );
      }
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, request: result.request });
  } catch (error: any) {
    console.error("Respond Request API Error:", error);
    if (error.message === "RequestNotFound") {
      return NextResponse.json({ error: "Blood request not found" }, { status: 404 });
    }
    if (error.message === "RequestAlreadyProcessed") {
      return NextResponse.json({ error: "Request has already been accepted or processed by another bank" }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
