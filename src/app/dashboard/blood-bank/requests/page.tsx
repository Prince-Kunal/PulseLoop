import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import DashboardShell from "@/components/DashboardShell";
import HospitalRequestsConsole from "@/components/HospitalRequestsConsole";

export default async function HospitalRequestsPage() {
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

  // Query actual database requests matching PENDING or assigned to this blood bank
  const requests = await prisma.bloodRequest.findMany({
    where: {
      OR: [
        { status: "PENDING" },
        { bloodBankId: bloodBankProfile.id }
      ]
    },
    include: {
      hospital: {
        select: {
          hospitalName: true,
          latitude: true,
          longitude: true,
        },
      },
    },
    orderBy: [
      { status: "asc" },
      { createdAt: "desc" }
    ],
  });

  return (
    <DashboardShell
      role="BLOOD_BANK"
      userEmail={session.user.email}
      userName={bloodBankProfile.bloodBankName}
    >
      <HospitalRequestsConsole
        bloodBankId={bloodBankProfile.id}
        initialRequests={requests as any}
      />
    </DashboardShell>
  );
}
