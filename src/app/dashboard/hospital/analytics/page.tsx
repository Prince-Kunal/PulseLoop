import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import DashboardShell from "@/components/DashboardShell";
import HospitalAnalytics from "@/components/HospitalAnalytics";

export default async function HospitalAnalyticsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
  }

  // Fetch hospital profile
  const hospitalProfile = await prisma.hospitalProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!hospitalProfile) {
    redirect("/auth/signin");
  }

  // Query all requests raised by this hospital, including their timeline records
  const requests = await prisma.bloodRequest.findMany({
    where: { hospitalId: hospitalProfile.id },
    include: {
      timeline: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <DashboardShell
      role="HOSPITAL"
      userEmail={session.user.email}
      userName={hospitalProfile.hospitalName}
    >
      <HospitalAnalytics
        requests={requests as any}
      />
    </DashboardShell>
  );
}
