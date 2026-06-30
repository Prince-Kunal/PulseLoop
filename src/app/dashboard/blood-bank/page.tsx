import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import DashboardShell from "@/components/DashboardShell";
import Link from "next/link";
import {
  ShieldAlert,
  CalendarDays,
  Database,
  Users,
  Compass,
  ArrowRight,
  Plus,
  Activity,
  Heart,
  Calendar
} from "lucide-react";

export default async function BloodBankDashboard() {
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

  // 1. Fetch live inventory from database
  const dbInventory = await prisma.inventory.findMany({
    where: { bloodBankId: bloodBankProfile.id },
  });

  const baseInventory = [
    { group: "A+", baseUnits: 14, color: "from-secondary/15 to-secondary/5 border-secondary/20 text-secondary" },
    { group: "A-", baseUnits: 5, color: "from-muted/40 to-muted/20 border-border text-muted-foreground" },
    { group: "B+", baseUnits: 18, color: "from-secondary/15 to-secondary/5 border-secondary/20 text-secondary" },
    { group: "B-", baseUnits: 3, color: "from-muted/40 to-muted/20 border-border text-muted-foreground" },
    { group: "AB+", baseUnits: 8, color: "from-secondary/15 to-secondary/5 border-secondary/20 text-secondary" },
    { group: "AB-", baseUnits: 2, color: "from-muted/40 to-muted/20 border-border text-muted-foreground" },
    { group: "O+", baseUnits: 25, color: "from-primary/15 to-primary/5 border-primary/20 text-primary" },
    { group: "O-", baseUnits: 9, color: "from-primary/15 to-primary/5 border-primary/20 text-primary" },
  ];

  const dynamicInventory = baseInventory.map((item) => {
    const dbItem = dbInventory.find((db) => db.bloodGroup === item.group);
    return {
      group: item.group,
      units: dbItem ? dbItem.units : item.baseUnits,
      color: item.color,
    };
  });

  const totalStockUnits = dynamicInventory.reduce((acc, item) => acc + item.units, 0);

  // 2. Fetch upcoming drives
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const upcomingDrives = await prisma.bloodDrive.findMany({
    where: {
      organizerId: bloodBankProfile.id,
      date: { gte: today },
    },
    orderBy: { date: "asc" },
    take: 3,
  });

  // 3. Fetch recent donations
  const recentDonations = await prisma.donationHistory.findMany({
    where: { bloodBankId: bloodBankProfile.id },
    orderBy: { donationDate: "desc" },
    take: 5,
    include: {
      donor: true,
    },
  });

  return (
    <DashboardShell
      role="BLOOD_BANK"
      userEmail={session.user.email}
      userName={bloodBankProfile.bloodBankName}
    >
      <div className="space-y-8">
        {/* Banner Header */}
        <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/15 via-background to-secondary/15 p-8 shadow-md">
          <div className="absolute right-0 top-0 -mr-6 -mt-6 w-36 h-36 rounded-full bg-primary/10 blur-xl pointer-events-none" />
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                Operations Hub
              </span>
              <h1 className="text-3xl font-bold tracking-tight text-foreground mt-1">
                {bloodBankProfile.bloodBankName}
              </h1>
              <p className="text-muted-foreground mt-2 max-w-xl text-sm leading-relaxed">
                Manage stock inventories, coordinate donation drives, verify hospital requests, and monitor recent intakes.
              </p>
            </div>
            <div className="bg-card border border-border rounded-xl px-5 py-3.5 shrink-0 flex flex-col justify-center shadow-xs">
              <span className="text-xs text-muted-foreground block">Hub ID</span>
              <span className="text-sm font-semibold text-primary font-mono mt-1">
                #LH-{bloodBankProfile.id.slice(-6).toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-card border border-border rounded-2xl p-5 shadow-xs hover:border-primary/20 transition-all flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Total Inventory</span>
              <span className="text-2xl font-bold text-foreground mt-1 block">{totalStockUnits} Units</span>
            </div>
            <Database className="h-8 w-8 text-primary opacity-80" />
          </div>

          <div className="bg-card border border-border rounded-2xl p-5 shadow-xs hover:border-primary/20 transition-all flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Pending Requests</span>
              <span className="text-2xl font-bold text-foreground mt-1 block">3</span>
            </div>
            <ShieldAlert className="h-8 w-8 text-amber-600 opacity-80" />
          </div>

          <div className="bg-card border border-border rounded-2xl p-5 shadow-xs hover:border-primary/20 transition-all flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Scheduled Drives</span>
              <span className="text-2xl font-bold text-foreground mt-1 block">{upcomingDrives.length} Upcoming</span>
            </div>
            <CalendarDays className="h-8 w-8 text-primary opacity-80" />
          </div>

          <div className="bg-card border border-border rounded-2xl p-5 shadow-xs hover:border-primary/20 transition-all flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Registered Donors</span>
              <span className="text-2xl font-bold text-foreground mt-1 block">184</span>
            </div>
            <Users className="h-8 w-8 text-indigo-600 opacity-80" />
          </div>
        </div>

        {/* Quick Actions Panel */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-md">
          <h3 className="text-base font-bold text-foreground mb-4">Quick Operations Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link
              href="/dashboard/blood-bank/record"
              className="p-5 bg-muted/20 border border-border hover:border-primary/25 rounded-2xl flex flex-col justify-between h-36 transition-all group hover:bg-muted/40 cursor-pointer"
            >
              <div className="h-9 w-9 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-600">
                <Heart className="h-5 w-5 fill-red-600" />
              </div>
              <div className="mt-4">
                <h4 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors flex items-center">
                  Record Donation <ArrowRight className="h-3.5 w-3.5 ml-1 transition-transform group-hover:translate-x-1" />
                </h4>
                <p className="text-muted-foreground text-[10px] mt-1 leading-relaxed">
                  Search donor profiles, verify intake eligibility, and save donation entries.
                </p>
              </div>
            </Link>

            <Link
              href="/dashboard/blood-bank/inventory"
              className="p-5 bg-muted/20 border border-border hover:border-primary/25 rounded-2xl flex flex-col justify-between h-36 transition-all group hover:bg-muted/40 cursor-pointer"
            >
              <div className="h-9 w-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-600">
                <Database className="h-5 w-5" />
              </div>
              <div className="mt-4">
                <h4 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors flex items-center">
                  Manage Inventory <ArrowRight className="h-3.5 w-3.5 ml-1 transition-transform group-hover:translate-x-1" />
                </h4>
                <p className="text-muted-foreground text-[10px] mt-1 leading-relaxed">
                  Perform manual checks, add/withdraw blood units, and check live stock levels.
                </p>
              </div>
            </Link>

            <Link
              href="/dashboard/blood-bank/drives"
              className="p-5 bg-muted/20 border border-border hover:border-primary/25 rounded-2xl flex flex-col justify-between h-36 transition-all group hover:bg-muted/40 cursor-pointer"
            >
              <div className="h-9 w-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-600">
                <Calendar className="h-5 w-5" />
              </div>
              <div className="mt-4">
                <h4 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors flex items-center">
                  Create Blood Drive <ArrowRight className="h-3.5 w-3.5 ml-1 transition-transform group-hover:translate-x-1" />
                </h4>
                <p className="text-muted-foreground text-[10px] mt-1 leading-relaxed">
                  Organize public blood intake events, configure capacities, and check coordinates.
                </p>
              </div>
            </Link>
          </div>
        </div>

        {/* Live Blood Inventory Summary */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-md">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-foreground">Blood Inventory Summary</h3>
              <p className="text-muted-foreground text-xs mt-1">Available blood units categorized by type.</p>
            </div>
            <Link
              href="/dashboard/blood-bank/inventory"
              className="px-3.5 py-2 bg-primary hover:bg-primary/95 text-primary-foreground rounded-xl text-xs font-semibold flex items-center transition-all cursor-pointer shadow-xs"
            >
              Update Stock
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {dynamicInventory.map((item) => (
              <div
                key={item.group}
                className={`rounded-xl border bg-gradient-to-br ${item.color} p-4 flex flex-col justify-between h-28 shadow-xs hover:scale-102 transition-transform`}
              >
                <span className="text-2xl font-black tracking-wider">{item.group}</span>
                <div className="text-right">
                  <span className="text-xl font-bold block">{item.units}</span>
                  <span className="text-[10px] uppercase text-muted-foreground/80 font-semibold tracking-wide">units</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Drives and Recent Donations Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Drives Coordinator */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-md flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-base font-bold text-foreground">Blood Donation Drives</h3>
                <Link href="/dashboard/blood-bank/drives" className="text-xs text-primary hover:text-primary/80 font-semibold flex items-center">
                  All Drives <ArrowRight className="h-3 w-3 ml-1" />
                </Link>
              </div>

              <div className="space-y-4">
                {upcomingDrives.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground text-xs italic">
                    No upcoming drives scheduled.
                  </div>
                ) : (
                  upcomingDrives.map((drive) => (
                    <div key={drive.id} className="p-4 bg-muted/20 border border-border rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-foreground">{drive.title}</span>
                        <span className="text-[9px] px-2 py-0.5 rounded bg-primary/10 border border-primary/20 text-primary font-bold">UPCOMING</span>
                      </div>
                      <p className="text-muted-foreground text-[10px]">
                        Date: {new Date(drive.date).toLocaleDateString()} | Time: {drive.startTime} - {drive.endTime}
                      </p>
                      <div className="flex items-center justify-between text-[10px] text-muted-foreground/80 pt-1">
                        <span>Organized at Lat: {drive.latitude}</span>
                        <span>Capacity: {drive.capacity}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Recent Intake Donations */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-md flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-base font-bold text-foreground">Recent Intakes</h3>
                <Link href="/dashboard/blood-bank/record" className="text-xs text-primary hover:text-primary/80 font-semibold flex items-center">
                  Record Intake <ArrowRight className="h-3 w-3 ml-1" />
                </Link>
              </div>

              <div className="space-y-4">
                {recentDonations.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground text-xs italic">
                    No donations recorded yet at this hub.
                  </div>
                ) : (
                  recentDonations.map((donation) => (
                    <div key={donation.id} className="p-3.5 bg-muted/20 border border-border rounded-xl flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold text-foreground">{donation.donor.fullName}</span>
                          <span className="inline-flex text-[9px] px-1.5 py-0.5 bg-red-500/10 text-red-600 border border-red-500/20 rounded font-bold">
                            {donation.bloodType}
                          </span>
                        </div>
                        <p className="text-[10px] text-muted-foreground">
                          Logged: {new Date(donation.donationDate).toLocaleDateString()} | Units: {donation.units}
                        </p>
                      </div>
                      <span className="text-[10px] font-semibold text-green-600 bg-green-500/10 px-2.5 py-1 rounded-full border border-green-500/20">
                        {donation.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
