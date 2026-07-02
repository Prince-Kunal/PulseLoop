import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import DashboardShell from "@/components/DashboardShell";
import NotificationsConsole from "@/components/NotificationsConsole";

export default async function NotificationsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
  }

  // Fetch author profile details to get userName
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

  // Query notifications
  const notifications = await prisma.userNotification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <DashboardShell
      role={session.user.role}
      userEmail={session.user.email}
      userName={name}
    >
      <NotificationsConsole
        initialNotifications={notifications as any}
      />
    </DashboardShell>
  );
}
