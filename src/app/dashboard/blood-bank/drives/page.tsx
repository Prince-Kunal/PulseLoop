import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import DashboardShell from "@/components/DashboardShell";
import DrivesManager from "@/components/DrivesManager";

export default async function BloodDrivesPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
  }

  // Get blood bank profile
  const bloodBankProfile = await prisma.bloodBankProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!bloodBankProfile) {
    redirect("/auth/signin");
  }

  // Query actual database blood drives organized by this blood bank
  const drives = await prisma.bloodDrive.findMany({
    where: { organizerId: bloodBankProfile.id },
    orderBy: { date: "asc" },
  });

  return (
    <DashboardShell
      role="BLOOD_BANK"
      userEmail={session.user.email}
      userName={bloodBankProfile.bloodBankName}
    >
      <DrivesManager
        organizerId={bloodBankProfile.id}
        initialDrives={drives}
      />
    </DashboardShell>
  );
}
