import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import DashboardShell from "@/components/DashboardShell";
import DonorSearch from "@/components/DonorSearch";

export default async function RecordDonationPage() {
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

  return (
    <DashboardShell
      role="BLOOD_BANK"
      userEmail={session.user.email}
      userName={bloodBankProfile.bloodBankName}
    >
      <div className="space-y-6">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">Operations / Intake Portal</span>
          <h2 className="text-2xl font-bold text-foreground mt-1">Record Blood Donation</h2>
          <p className="text-muted-foreground text-xs mt-1">
            Lookup a donor profile by credentials to verify eligibility, run point calculations, and track streaks.
          </p>
        </div>

        <DonorSearch bloodBankId={bloodBankProfile.id} />
      </div>
    </DashboardShell>
  );
}
