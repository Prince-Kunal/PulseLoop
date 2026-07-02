import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import DashboardShell from "@/components/DashboardShell";
import BloodBankAnalytics from "@/components/BloodBankAnalytics";

export default async function BloodBankAnalyticsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
  }

  // Fetch blood bank profile
  const bloodBankProfile = await prisma.bloodBankProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!bloodBankProfile) {
    redirect("/auth/signin");
  }

  // Fetch inventory levels
  const inventory = await prisma.inventory.findMany({
    where: { bloodBankId: bloodBankProfile.id },
  });

  // Fetch donation histories
  const donations = await prisma.donationHistory.findMany({
    where: { bloodBankId: bloodBankProfile.id },
    orderBy: { donationDate: "desc" },
  });

  // Fetch drives organizer count
  const drivesCount = await prisma.bloodDrive.count({
    where: { organizerId: bloodBankProfile.id },
  });

  // Fetch hospital requests fulfilled by this bank
  const fulfilledRequestsCount = await prisma.bloodRequest.count({
    where: { bloodBankId: bloodBankProfile.id, status: "FULFILLED" },
  });

  // Fetch active requests assigned to this bank (ACCEPTED or IN_PROGRESS)
  const activeRequestsCount = await prisma.bloodRequest.count({
    where: {
      bloodBankId: bloodBankProfile.id,
      status: { in: ["ACCEPTED", "IN_PROGRESS"] },
    },
  });

  // Fetch global pending requests
  const pendingRequestsCount = await prisma.bloodRequest.count({
    where: { status: "PENDING" },
  });

  return (
    <DashboardShell
      role="BLOOD_BANK"
      userEmail={session.user.email}
      userName={bloodBankProfile.bloodBankName}
    >
      <BloodBankAnalytics
        inventory={inventory as any}
        donations={donations as any}
        drivesCount={drivesCount}
        fulfilledCount={fulfilledRequestsCount}
        activeCount={activeRequestsCount}
        pendingCount={pendingRequestsCount}
      />
    </DashboardShell>
  );
}
