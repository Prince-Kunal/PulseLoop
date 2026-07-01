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
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Request ID is required" }, { status: 400 });
  }

  try {
    const requestRecord = await prisma.bloodRequest.findUnique({
      where: { id },
      include: {
        hospital: {
          select: {
            id: true,
            hospitalName: true,
            latitude: true,
            longitude: true,
          },
        },
        bloodBank: {
          select: {
            id: true,
            bloodBankName: true,
            latitude: true,
            longitude: true,
          },
        },
      },
    });

    if (!requestRecord) {
      return NextResponse.json({ error: "Blood request not found" }, { status: 404 });
    }

    return NextResponse.json({ request: requestRecord });
  } catch (error: any) {
    console.error("Fetch Blood Request Details Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
