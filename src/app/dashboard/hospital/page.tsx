import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import DashboardShell from "@/components/DashboardShell";
import {
  FilePlus2,
  FileSpreadsheet,
  Activity,
  CheckCircle,
  Clock,
  Building,
  Plus,
  ArrowUpRight
} from "lucide-react";

export default async function HospitalDashboard() {
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

  return (
    <DashboardShell
      role="HOSPITAL"
      userEmail={session.user.email}
      userName={hospitalProfile.hospitalName}
    >
      <div className="space-y-8">
        {/* Hospital Header Banner */}
        <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/15 via-background to-secondary/15 p-8 shadow-md">
          <div className="absolute right-0 top-0 -mr-6 -mt-6 w-36 h-36 rounded-full bg-primary/10 blur-xl pointer-events-none" />
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                Hospital Portal
              </span>
              <h1 className="text-3xl font-bold tracking-tight text-foreground mt-1">
                {hospitalProfile.hospitalName}
              </h1>
              <p className="text-muted-foreground mt-2 max-w-xl text-sm leading-relaxed">
                Submit urgent blood requests and track delivery statuses directly. Local blood banks will prioritize your requests based on live stock levels.
              </p>
            </div>
            <div className="bg-card border border-border rounded-xl px-5 py-3.5 shrink-0 flex flex-col justify-center shadow-xs">
              <span className="text-xs text-muted-foreground block">Coordinates</span>
              <span className="text-sm font-semibold text-primary font-mono mt-1">
                {hospitalProfile.latitude.toFixed(4)}° N, {hospitalProfile.longitude.toFixed(4)}° E
              </span>
            </div>
          </div>
        </div>

        {/* Analytics Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-xs hover:border-primary/20 transition-all flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Active Requests</span>
              <span className="text-3xl font-bold text-foreground block">2</span>
              <p className="text-muted-foreground/80 text-xs mt-0.5">Currently pending verification</p>
            </div>
            <div className="p-3 bg-primary/10 border border-primary/20 rounded-xl">
              <Activity className="h-6 w-6 text-primary" />
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 shadow-xs hover:border-primary/20 transition-all flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Fulfilled Requests</span>
              <span className="text-3xl font-bold text-foreground block">18</span>
              <p className="text-muted-foreground/80 text-xs mt-0.5">Units received this month</p>
            </div>
            <div className="p-3 bg-secondary/10 border border-secondary/20 rounded-xl">
              <CheckCircle className="h-6 w-6 text-secondary" />
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 shadow-xs hover:border-primary/20 transition-all flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Avg Response Time</span>
              <span className="text-3xl font-bold text-foreground block">24m</span>
              <p className="text-muted-foreground/80 text-xs mt-0.5">From request to donor priority</p>
            </div>
            <div className="p-3 bg-amber-500/10 border border-amber-500/25 rounded-xl">
              <Clock className="h-6 w-6 text-amber-600" />
            </div>
          </div>
        </div>

        {/* Action Panel: Request Creator and Status Tracking */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* New Request Creation Form Placeholder */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-md flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <FilePlus2 className="h-5 w-5 text-primary" />
                <h3 className="text-base font-bold text-foreground">Create Blood Request</h3>
              </div>
              <p className="text-muted-foreground text-xs leading-relaxed">
                (Request creation will be enabled in the next stage. When initialized, requests will directly notify matching local blood banks.)
              </p>
              
              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">Blood Group Needed</label>
                  <select disabled className="w-full px-3 py-2 bg-muted/30 border border-border rounded-lg text-muted-foreground/60 text-xs focus:outline-none">
                    <option>Select group...</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">Quantity (Units)</label>
                  <input type="number" disabled placeholder="e.g. 5" className="w-full px-3 py-2 bg-muted/30 border border-border rounded-lg text-muted-foreground/60 text-xs focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">Urgency Level</label>
                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                    <span className="py-2 text-center rounded bg-muted/30 border border-border text-muted-foreground/50 font-semibold">URGENT</span>
                    <span className="py-2 text-center rounded bg-muted/30 border border-border text-muted-foreground/50 font-semibold">CRITICAL</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <button disabled className="w-full flex items-center justify-center py-2.5 px-4 rounded-xl bg-muted text-muted-foreground/40 text-xs font-semibold transition-all cursor-not-allowed border border-border">
                <Plus className="h-4 w-4 mr-1.5" />
                Initialize Request
              </button>
            </div>
          </div>

          {/* Active Request Tracker Table Placeholder */}
          <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-6 shadow-md">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center space-x-2">
                <FileSpreadsheet className="h-5 w-5 text-primary" />
                <h3 className="text-base font-bold text-foreground">Active Request Logs</h3>
              </div>
              <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
                Real-time Sync
              </span>
            </div>

            {/* Logs Table Placeholder */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border/60">
                <thead>
                  <tr className="text-left text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    <th className="py-3 px-2">ID</th>
                    <th className="py-3 px-2">Blood Group</th>
                    <th className="py-3 px-2">Units</th>
                    <th className="py-3 px-2">Urgency</th>
                    <th className="py-3 px-2">Status</th>
                    <th className="py-3 px-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40 text-xs">
                  <tr className="hover:bg-muted/10 transition-all">
                    <td className="py-3.5 px-2 font-medium text-foreground">#PL-4091</td>
                    <td className="py-3.5 px-2">
                      <span className="inline-flex items-center px-2 py-0.5 rounded bg-secondary/10 text-secondary font-bold border border-secondary/20">O+</span>
                    </td>
                    <td className="py-3.5 px-2 text-foreground">4 units</td>
                    <td className="py-3.5 px-2">
                      <span className="inline-flex px-2 py-0.5 rounded-full bg-secondary/10 text-secondary text-[10px] font-semibold border border-secondary/20">CRITICAL</span>
                    </td>
                    <td className="py-3.5 px-2">
                      <span className="inline-flex items-center text-amber-600">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500 mr-1.5 animate-pulse"></span>
                        Contacting Donors
                      </span>
                    </td>
                    <td className="py-3.5 px-2 text-right">
                      <button className="text-primary hover:text-primary/80 font-semibold inline-flex items-center hover:underline cursor-pointer">
                        Track <ArrowUpRight className="h-3 w-3 ml-0.5" />
                      </button>
                    </td>
                  </tr>
                  <tr className="hover:bg-muted/10 transition-all">
                    <td className="py-3.5 px-2 font-medium text-foreground">#PL-3982</td>
                    <td className="py-3.5 px-2">
                      <span className="inline-flex items-center px-2 py-0.5 rounded bg-secondary/10 text-secondary font-bold border border-secondary/20">AB-</span>
                    </td>
                    <td className="py-3.5 px-2 text-foreground">2 units</td>
                    <td className="py-3.5 px-2">
                      <span className="inline-flex px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-semibold border border-primary/20">URGENT</span>
                    </td>
                    <td className="py-3.5 px-2">
                      <span className="inline-flex items-center text-primary">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary mr-1.5"></span>
                        Verifying Stock
                      </span>
                    </td>
                    <td className="py-3.5 px-2 text-right">
                      <button className="text-primary hover:text-primary/80 font-semibold inline-flex items-center hover:underline cursor-pointer">
                        Track <ArrowUpRight className="h-3 w-3 ml-0.5" />
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
