import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { recordDonation } from "@/services/donationService";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { donorId, bloodBankId, units } = body;

    if (!donorId || !bloodBankId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const parsedUnits = units ? parseInt(units, 10) : 1;

    const result = await recordDonation({
      donorId,
      bloodBankId,
      units: parsedUnits,
      donationDate: new Date(),
      status: "COMPLETED",
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Record Donation API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
