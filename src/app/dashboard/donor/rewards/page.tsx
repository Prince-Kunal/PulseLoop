import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import DashboardShell from "@/components/DashboardShell";
import RewardsCenter from "@/components/RewardsCenter";

export default async function DonorRewardsPage() {
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

  // Fetch all rewards
  const rewardsList = await prisma.reward.findMany();

  // Fetch redeemed rewards for this donor
  const userRewards = await prisma.userReward.findMany({
    where: { donorId: donorProfile.id },
    include: {
      reward: true,
    },
  });

  return (
    <DashboardShell
      role="DONOR"
      userEmail={session.user.email}
      userName={donorProfile.fullName}
    >
      <RewardsCenter
        donorProfile={donorProfile as any}
        allRewards={rewardsList as any}
        redeemedHistory={userRewards as any}
      />
    </DashboardShell>
  );
}
