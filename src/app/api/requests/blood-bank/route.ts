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
  const bloodBankId = searchParams.get("bloodBankId");

  if (!bloodBankId) {
    return NextResponse.json({ error: "Blood Bank ID is required" }, { status: 400 });
  }

  try {
    // Fetch pending requests OR requests assigned to this blood bank
    const requests = await prisma.bloodRequest.findMany({
      where: {
        OR: [
          { status: "PENDING" },
          { bloodBankId: bloodBankId }
        ]
      },
      include: {
        hospital: {
          select: {
            id: true,
            hospitalName: true,
            latitude: true,
            longitude: true,
          },
        },
      },
      orderBy: [
        { status: "asc" }, // Keeps pending requests grouped or structured
        { createdAt: "desc" }
      ],
    });

    return NextResponse.json({ requests });
  } catch (error: any) {
    console.error("Fetch Blood Bank Hospital Requests Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
