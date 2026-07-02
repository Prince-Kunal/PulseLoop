import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import DashboardShell from "@/components/DashboardShell";
import CommunityFeed from "@/components/CommunityFeed";

export default async function CommunityPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
  }

  // Fetch author details based on role
  let authorName = "System Operator";
  if (session.user.role === "DONOR") {
    const profile = await prisma.donorProfile.findUnique({ where: { userId: session.user.id } });
    if (profile) authorName = profile.fullName;
  } else if (session.user.role === "HOSPITAL") {
    const profile = await prisma.hospitalProfile.findUnique({ where: { userId: session.user.id } });
    if (profile) authorName = profile.hospitalName;
  } else if (session.user.role === "BLOOD_BANK") {
    const profile = await prisma.bloodBankProfile.findUnique({ where: { userId: session.user.id } });
    if (profile) authorName = profile.bloodBankName;
  }

  const posts = await prisma.communityPost.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <DashboardShell
      role={session.user.role}
      userEmail={session.user.email}
      userName={authorName}
    >
      <CommunityFeed
        userRole={session.user.role}
        userName={authorName}
        initialPosts={posts as any}
      />
    </DashboardShell>
  );
}
