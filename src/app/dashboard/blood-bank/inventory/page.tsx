import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import DashboardShell from "@/components/DashboardShell";
import InventoryManager from "@/components/InventoryManager";

export default async function InventoryPage() {
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

  // Query actual database inventory levels
  const dbInventory = await prisma.inventory.findMany({
    where: { bloodBankId: bloodBankProfile.id },
  });

  return (
    <DashboardShell
      role="BLOOD_BANK"
      userEmail={session.user.email}
      userName={bloodBankProfile.bloodBankName}
    >
      <InventoryManager
        bloodBankId={bloodBankProfile.id}
        initialInventory={dbInventory}
      />
    </DashboardShell>
  );
}
