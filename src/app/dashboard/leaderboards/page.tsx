import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import DashboardShell from "@/components/DashboardShell";
import LeaderboardsConsole from "@/components/LeaderboardsConsole";

export default async function LeaderboardsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
  }

  // Retrieve user name
  let name = "System Operator";
  if (session.user.role === "DONOR") {
    const profile = await prisma.donorProfile.findUnique({ where: { userId: session.user.id } });
    if (profile) name = profile.fullName;
  } else if (session.user.role === "HOSPITAL") {
    const profile = await prisma.hospitalProfile.findUnique({ where: { userId: session.user.id } });
    if (profile) name = profile.hospitalName;
  } else if (session.user.role === "BLOOD_BANK") {
    const profile = await prisma.bloodBankProfile.findUnique({ where: { userId: session.user.id } });
    if (profile) name = profile.bloodBankName;
  }

  // Fetch all donors with their badges
  const donors = await prisma.donorProfile.findMany({
    include: {
      badges: {
        select: {
          name: true,
        },
      },
    },
  });

  return (
    <DashboardShell
      role={session.user.role}
      userEmail={session.user.email}
      userName={name}
    >
      <LeaderboardsConsole
        initialDonors={donors as any}
      />
    </DashboardShell>
  );
}
