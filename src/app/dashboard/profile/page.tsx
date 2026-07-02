import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import DashboardShell from "@/components/DashboardShell";
import ProfileSettings from "@/components/ProfileSettings";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
  }

  // Query profile details depending on role
  let profileData: any = null;
  let name = "System Operator";

  if (session.user.role === "DONOR") {
    profileData = await prisma.donorProfile.findUnique({
      where: { userId: session.user.id },
    });
    if (profileData) name = profileData.fullName;
  } else if (session.user.role === "HOSPITAL") {
    profileData = await prisma.hospitalProfile.findUnique({
      where: { userId: session.user.id },
    });
    if (profileData) name = profileData.hospitalName;
  } else if (session.user.role === "BLOOD_BANK") {
    profileData = await prisma.bloodBankProfile.findUnique({
      where: { userId: session.user.id },
    });
    if (profileData) name = profileData.bloodBankName;
  }

  if (!profileData) {
    redirect("/auth/signin");
  }

  return (
    <DashboardShell
      role={session.user.role}
      userEmail={session.user.email}
      userName={name}
    >
      <ProfileSettings
        userRole={session.user.role}
        userEmail={session.user.email!}
        profile={profileData as any}
      />
    </DashboardShell>
  );
}
