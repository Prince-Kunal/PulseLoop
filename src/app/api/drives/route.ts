import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET: Fetch scheduled blood drives organized by the blood bank
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const organizerId = searchParams.get("organizerId");

  if (!organizerId) {
    return NextResponse.json({ error: "Organizer ID is required" }, { status: 400 });
  }

  try {
    const drives = await prisma.bloodDrive.findMany({
      where: { organizerId },
      orderBy: { date: "asc" },
    });

    return NextResponse.json({ drives });
  } catch (error: any) {
    console.error("Fetch Blood Drives Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Schedule a new blood drive
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      title,
      description,
      date,
      startTime,
      endTime,
      latitude,
      longitude,
      capacity,
      organizerId
    } = body;

    if (
      !title ||
      !description ||
      !date ||
      !startTime ||
      !endTime ||
      latitude === undefined ||
      longitude === undefined ||
      capacity === undefined ||
      !organizerId
    ) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const drive = await prisma.bloodDrive.create({
      data: {
        title,
        description,
        date: new Date(date),
        startTime,
        endTime,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        capacity: parseInt(capacity, 10),
        organizerId,
      },
    });

    return NextResponse.json({ success: true, drive }, { status: 201 });
  } catch (error: any) {
    console.error("Create Blood Drive Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT: Update details of an existing blood drive
export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      id,
      title,
      description,
      date,
      startTime,
      endTime,
      latitude,
      longitude,
      capacity
    } = body;

    if (!id) {
      return NextResponse.json({ error: "Drive ID is required" }, { status: 400 });
    }

    const drive = await prisma.bloodDrive.update({
      where: { id },
      data: {
        title,
        description,
        date: date ? new Date(date) : undefined,
        startTime,
        endTime,
        latitude: latitude !== undefined ? parseFloat(latitude) : undefined,
        longitude: longitude !== undefined ? parseFloat(longitude) : undefined,
        capacity: capacity !== undefined ? parseInt(capacity, 10) : undefined,
      },
    });

    return NextResponse.json({ success: true, drive });
  } catch (error: any) {
    console.error("Update Blood Drive Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE: Cancel/delete a blood drive
export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Drive ID is required" }, { status: 400 });
  }

  try {
    await prisma.bloodDrive.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Delete Blood Drive Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
