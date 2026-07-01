import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import DashboardShell from "@/components/DashboardShell";
import RequestsManager from "@/components/RequestsManager";

export default async function HospitalRequestsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
  }

  // Get hospital profile
  const hospitalProfile = await prisma.hospitalProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!hospitalProfile) {
    redirect("/auth/signin");
  }

  // Query actual database blood requests raised by this hospital
  const requests = await prisma.bloodRequest.findMany({
    where: { hospitalId: hospitalProfile.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <DashboardShell
      role="HOSPITAL"
      userEmail={session.user.email}
      userName={hospitalProfile.hospitalName}
    >
      <RequestsManager
        hospitalId={hospitalProfile.id}
        initialRequests={requests}
      />
    </DashboardShell>
  );
}
