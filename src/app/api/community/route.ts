import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const posts = await prisma.communityPost.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ posts });
  } catch (error: any) {
    console.error("Fetch Community Posts Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Only Blood Banks or Administrators can publish posts.
  if (session.user.role !== "BLOOD_BANK") {
    return NextResponse.json({ error: "Only blood banks can publish announcements." }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { title, description, imageUrl, authorName } = body;

    if (!title || !description || !authorName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const post = await prisma.communityPost.create({
      data: {
        title,
        description,
        imageUrl: imageUrl || null,
        authorName,
        authorRole: "BLOOD_BANK",
      },
    });

    return NextResponse.json({ success: true, post }, { status: 201 });
  } catch (error: any) {
    console.error("Create Community Post Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
