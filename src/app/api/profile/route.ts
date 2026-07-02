import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { fullName, phone, city, state, password } = body;

    // Run dynamic updates
    await prisma.$transaction(async (tx) => {
      // 1. Update Profile Specific Details
      if (session.user.role === "DONOR") {
        await tx.donorProfile.update({
          where: { userId: session.user.id },
          data: {
            fullName: fullName || undefined,
            phone: phone || undefined,
            city: city || null,
            state: state || null,
          },
        });
      } else if (session.user.role === "HOSPITAL") {
        await tx.hospitalProfile.update({
          where: { userId: session.user.id },
          data: {
            hospitalName: fullName || undefined,
            city: city || null,
            state: state || null,
          },
        });
      } else if (session.user.role === "BLOOD_BANK") {
        await tx.bloodBankProfile.update({
          where: { userId: session.user.id },
          data: {
            bloodBankName: fullName || undefined,
            city: city || null,
            state: state || null,
          },
        });
      }

      // 2. Process Password change if provided
      if (password && password.trim() !== "") {
        const hashedPassword = await bcrypt.hash(password, 10);
        await tx.user.update({
          where: { id: session.user.id },
          data: { password: hashedPassword },
        });
      }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Profile Update API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
