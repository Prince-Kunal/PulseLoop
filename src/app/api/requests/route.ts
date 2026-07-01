import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET: Fetch blood requests raised by the hospital
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const hospitalId = searchParams.get("hospitalId");

  if (!hospitalId) {
    return NextResponse.json({ error: "Hospital ID is required" }, { status: 400 });
  }

  try {
    const requests = await prisma.bloodRequest.findMany({
      where: { hospitalId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ requests });
  } catch (error: any) {
    console.error("Fetch Hospital Requests Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Create a new blood request
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      hospitalId,
      bloodGroup,
      unitsRequired,
      urgency,
      notes,
      patientAge
    } = body;

    if (!hospitalId || !bloodGroup || !unitsRequired || !urgency) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const units = parseInt(unitsRequired, 10);
    if (isNaN(units) || units <= 0) {
      return NextResponse.json({ error: "Units required must be a positive integer" }, { status: 400 });
    }

    const age = patientAge ? parseInt(patientAge, 10) : null;
    if (age !== null && (isNaN(age) || age <= 0)) {
      return NextResponse.json({ error: "Patient age must be a positive integer" }, { status: 400 });
    }

    // Save request to database
    const newRequest = await prisma.bloodRequest.create({
      data: {
        hospitalId,
        bloodGroup,
        unitsRequired: units,
        urgency, // "LOW", "MEDIUM", "HIGH", "CRITICAL"
        notes: notes || null,
        patientAge: age,
        status: "PENDING",
      },
    });

    return NextResponse.json({ success: true, request: newRequest }, { status: 201 });
  } catch (error: any) {
    console.error("Create Blood Request Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
