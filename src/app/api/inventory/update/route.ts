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
    const { bloodBankId, bloodGroup, unitsDelta } = body;

    if (!bloodBankId || !bloodGroup || unitsDelta === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const delta = parseInt(unitsDelta, 10);
    if (isNaN(delta)) {
      return NextResponse.json({ error: "Invalid units delta" }, { status: 400 });
    }

    // 1. Fetch current inventory level
    const currentInventory = await prisma.inventory.findUnique({
      where: {
        bloodBankId_bloodGroup: {
          bloodBankId,
          bloodGroup,
        },
      },
    });

    const currentUnits = currentInventory?.units ?? 0;
    const newUnits = currentUnits + delta;

    // 2. Validate that inventory cannot become negative
    if (newUnits < 0) {
      return NextResponse.json(
        { error: `Cannot remove units. Inventory for ${bloodGroup} would become negative (${newUnits} units).` },
        { status: 400 }
      );
    }

    // 3. Persist changes to database
    const updated = await prisma.inventory.upsert({
      where: {
        bloodBankId_bloodGroup: {
          bloodBankId,
          bloodGroup,
        },
      },
      update: {
        units: newUnits,
      },
      create: {
        bloodBankId,
        bloodGroup,
        units: newUnits,
      },
    });

    return NextResponse.json({ success: true, inventory: updated });
  } catch (error: any) {
    console.error("Inventory Update API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
