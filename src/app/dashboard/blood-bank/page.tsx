import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import DashboardShell from "@/components/DashboardShell";
import {
  ShieldAlert,
  CalendarDays,
  Database,
  Users,
  Compass,
  ArrowRight,
  Plus
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

  // Mock blood groups stock data
  const mockInventory = [
    { group: "A+", units: 14, color: "from-secondary/15 to-secondary/5 border-secondary/20 text-secondary" },
    { group: "A-", units: 5, color: "from-muted/40 to-muted/20 border-border text-muted-foreground" },
    { group: "B+", units: 18, color: "from-secondary/15 to-secondary/5 border-secondary/20 text-secondary" },
    { group: "B-", units: 3, color: "from-muted/40 to-muted/20 border-border text-muted-foreground" },
    { group: "AB+", units: 8, color: "from-secondary/15 to-secondary/5 border-secondary/20 text-secondary" },
    { group: "AB-", units: 2, color: "from-muted/40 to-muted/20 border-border text-muted-foreground" },
    { group: "O+", units: 25, color: "from-primary/15 to-primary/5 border-primary/20 text-primary" },
    { group: "O-", units: 9, color: "from-primary/15 to-primary/5 border-primary/20 text-primary" },
  ];

  return (
    <DashboardShell
      role="BLOOD_BANK"
      userEmail={session.user.email}
      userName={bloodBankProfile.bloodBankName}
    >
      <div className="space-y-8">
        {/* Blood Bank Banner Header */}
        <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/15 via-background to-secondary/15 p-8 shadow-md">
          <div className="absolute right-0 top-0 -mr-6 -mt-6 w-36 h-36 rounded-full bg-primary/10 blur-xl pointer-events-none" />
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                Blood Bank Operations Hub
              </span>
              <h1 className="text-3xl font-bold tracking-tight text-foreground mt-1">
                {bloodBankProfile.bloodBankName}
              </h1>
              <p className="text-muted-foreground mt-2 max-w-xl text-sm leading-relaxed">
                Manage stock inventories, coordinate donation drives, verify hospital requests, and trigger local donor priority list notifications.
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

        {/* Quick Operations Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-card border border-border rounded-2xl p-5 shadow-xs hover:border-primary/20 transition-all flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Total Inventory</span>
              <span className="text-2xl font-bold text-foreground mt-1 block">84 Units</span>
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
              <span className="text-2xl font-bold text-foreground mt-1 block">1 Active</span>
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

        {/* Inventory Stock Grid */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-md">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-foreground">Live Blood Inventory</h3>
              <p className="text-muted-foreground text-xs mt-1">Stock status of available blood units categorized by type.</p>
            </div>
            <button className="px-3 py-1.5 bg-primary hover:bg-primary/90 text-white rounded-lg text-xs font-semibold flex items-center transition-all cursor-pointer shadow-sm shadow-primary/10">
              <Plus className="h-3.5 w-3.5 mr-1" />
              Update Stock
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {mockInventory.map((item) => (
              <div
                key={item.group}
                className={`rounded-xl border bg-gradient-to-br ${item.color} p-4 flex flex-col justify-between h-28`}
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

        {/* Drives and Hospital Requests Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Drives Coordinator */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-md">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-foreground">Blood Donation Drives</h3>
              <button className="text-xs text-primary hover:text-primary/80 font-semibold flex items-center">
                Schedule Drive <ArrowRight className="h-3 w-3 ml-1" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-muted/20 border border-border rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground">Summer LifeSaver Drive</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-primary/10 border border-primary/20 text-primary">ACTIVE</span>
                </div>
                <p className="text-muted-foreground text-xs">
                  Date: June 8, 2026 | Location: Plaza East Gym (Within 5 km radius)
                </p>
                <div className="flex items-center justify-between text-[10px] text-muted-foreground/80 pt-1">
                  <span>Signups: 24 Donors</span>
                  <span>Est. Yield: 20 Units</span>
                </div>
              </div>
            </div>
          </div>

          {/* Incoming Hospital Requests */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-md">
            <h3 className="text-base font-bold text-foreground mb-5">Incoming Hospital Requests</h3>

            <div className="space-y-4">
              <div className="p-4 bg-muted/20 border border-border rounded-xl flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-foreground">City General Hospital</span>
                    <span className="inline-flex text-[9px] px-1.5 py-0.5 bg-secondary/20 text-secondary border border-secondary/30 rounded font-semibold">URGENT</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    Needs 4 units of O+ | Requested 15 mins ago
                  </p>
                </div>
                <button className="px-3 py-1.5 bg-card border border-border hover:bg-muted text-foreground rounded-lg text-xs font-semibold transition-colors cursor-pointer">
                  Process
                </button>
              </div>

              <div className="p-4 bg-muted/20 border border-border rounded-xl flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-foreground">Children's Hospital Clinic</span>
                    <span className="inline-flex text-[9px] px-1.5 py-0.5 bg-amber-500/10 text-amber-600 border border-amber-500/20 rounded font-semibold">NORMAL</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    Needs 2 units of A- | Requested 1 hour ago
                  </p>
                </div>
                <button className="px-3 py-1.5 bg-card border border-border hover:bg-muted text-foreground rounded-lg text-xs font-semibold transition-colors cursor-pointer">
                  Process
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
