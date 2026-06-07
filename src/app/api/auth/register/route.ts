import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, role } = body;

    if (!email || !password || !role) {
      return NextResponse.json(
        { error: "Email, password, and role are required." },
        { status: 400 }
      );
    }

    if (!["DONOR", "HOSPITAL", "BLOOD_BANK"].includes(role)) {
      return NextResponse.json(
        { error: "Invalid role specified." },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "A user with this email already exists." },
        { status: 400 }
      );
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user and profile in a transaction
    const result = await prisma.$transaction(async (tx: any) => {
      const newUser = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          role,
        },
      });

      if (role === "DONOR") {
        const { fullName, dateOfBirth, phone, latitude, longitude, bloodGroup } = body;

        if (!fullName || !dateOfBirth || !phone || latitude === undefined || longitude === undefined || !bloodGroup) {
          throw new Error("Missing required fields for Donor profile.");
        }

        await tx.donorProfile.create({
          data: {
            userId: newUser.id,
            fullName,
            dateOfBirth: new Date(dateOfBirth),
            phone,
            latitude: parseFloat(latitude),
            longitude: parseFloat(longitude),
            bloodGroup,
          },
        });
      } else if (role === "HOSPITAL") {
        const { hospitalName, latitude, longitude } = body;

        if (!hospitalName || latitude === undefined || longitude === undefined) {
          throw new Error("Missing required fields for Hospital profile.");
        }

        await tx.hospitalProfile.create({
          data: {
            userId: newUser.id,
            hospitalName,
            latitude: parseFloat(latitude),
            longitude: parseFloat(longitude),
          },
        });
      } else if (role === "BLOOD_BANK") {
        const { bloodBankName, latitude, longitude } = body;

        if (!bloodBankName || latitude === undefined || longitude === undefined) {
          throw new Error("Missing required fields for Blood Bank profile.");
        }

        await tx.bloodBankProfile.create({
          data: {
            userId: newUser.id,
            bloodBankName,
            latitude: parseFloat(latitude),
            longitude: parseFloat(longitude),
          },
        });
      }

      return newUser;
    });

    return NextResponse.json(
      { message: "Registration successful", userId: result.id },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: error.message || "Something went wrong during registration." },
      { status: 500 }
    );
  }
}
