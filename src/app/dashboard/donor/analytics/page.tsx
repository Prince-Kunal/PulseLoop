import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import DashboardShell from "@/components/DashboardShell";
import DonorAnalytics from "@/components/DonorAnalytics";

export default async function DonorAnalyticsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
  }

  // Fetch donor profile
  const donorProfile = await prisma.donorProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!donorProfile) {
    redirect("/auth/signin");
  }

  // Fetch donation histories
  const donationHistory = await prisma.donationHistory.findMany({
    where: { donorId: donorProfile.id },
    orderBy: { donationDate: "desc" },
  });

  // Fetch emergency responses and notifications matching this donor
  const notificationsCount = await prisma.notification.count({
    where: { donorId: donorProfile.id },
  });

  const responses = await prisma.emergencyResponse.findMany({
    where: { donorId: donorProfile.id },
  });

  // Fetch rewards unlocked
  const rewardsCount = await prisma.userReward.count({
    where: { donorId: donorProfile.id },
  });

  // Fetch badges unlocked
  const badgesCount = await prisma.donorProfile.findUnique({
    where: { id: donorProfile.id },
    select: {
      _count: {
        select: { badges: true },
      },
    },
  });

  return (
    <DashboardShell
      role="DONOR"
      userEmail={session.user.email}
      userName={donorProfile.fullName}
    >
      <DonorAnalytics
        profile={donorProfile as any}
        history={donationHistory as any}
        notificationsCount={notificationsCount}
        responses={responses as any}
        rewardsCount={rewardsCount}
        badgesCount={badgesCount?._count.badges ?? 0}
      />
    </DashboardShell>
  );
}
