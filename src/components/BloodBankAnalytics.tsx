"use client";

import {
  Database,
  Calendar,
  Building2,
  CheckCircle2,
  AlertTriangle,
  BarChart3,
  Heart,
  Droplet
} from "lucide-react";

interface InventoryItem {
  id: string;
  bloodGroup: string;
  units: number;
}

interface Donation {
  id: string;
  donationDate: string | Date;
  units: number;
}

interface BloodBankAnalyticsProps {
  inventory: InventoryItem[];
  donations: Donation[];
  drivesCount: number;
  fulfilledCount: number;
  activeCount: number;
  pendingCount: number;
}

export default function BloodBankAnalytics({
  inventory,
  donations,
  drivesCount,
  fulfilledCount,
  activeCount,
  pendingCount,
}: BloodBankAnalyticsProps) {
  // Low stock threshold
  const LOW_STOCK_LIMIT = 5;

  const lowStockAlerts = inventory.filter((item) => item.units <= LOW_STOCK_LIMIT);

  // Group by blood type for distribution
  const totalInventoryUnits = inventory.reduce((acc, item) => acc + item.units, 0);

  // Monthly intake grouping
  const getMonthlyIntake = () => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const counts = Array(12).fill(0);

    donations.forEach((d) => {
      const date = new Date(d.donationDate);
      if (date.getFullYear() === 2026) {
        counts[date.getMonth()] += d.units;
      }
    });

    return months.map((m, idx) => ({
      month: m,
      units: counts[idx],
    })).filter((item, idx) => item.units > 0 || idx <= new Date().getMonth());
  };

  const monthlyTimeline = getMonthlyIntake();

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <span className="text-xs font-semibold uppercase tracking-wider text-primary">Operations & Stocks</span>
        <h2 className="text-2xl font-bold text-foreground mt-1">Blood Bank Analytics</h2>
        <p className="text-muted-foreground text-xs mt-1">
          Monitor your active reserves, critical stock alerts, intake timelines, and hospital supply support rates.
        </p>
      </div>

      {/* Grid: 4 stats overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Donations Intake */}
        <div className="bg-card border border-border p-5 rounded-2xl flex flex-col justify-between shadow-2xs hover:border-primary/10 transition-all">
          <Heart className="h-5 w-5 text-secondary" />
          <div className="mt-4">
            <span className="text-2xl font-black text-foreground block">{donations.length}</span>
            <span className="text-[9px] uppercase font-bold text-muted-foreground mt-0.5 block">Donations Recorded</span>
          </div>
        </div>

        {/* Drives organized */}
        <div className="bg-card border border-border p-5 rounded-2xl flex flex-col justify-between shadow-2xs hover:border-primary/10 transition-all">
          <Calendar className="h-5 w-5 text-primary" />
          <div className="mt-4">
            <span className="text-2xl font-black text-foreground block">{drivesCount}</span>
            <span className="text-[9px] uppercase font-bold text-muted-foreground mt-0.5 block">Drives Conducted</span>
          </div>
        </div>

        {/* Fulfilled hospital requests */}
        <div className="bg-card border border-border p-5 rounded-2xl flex flex-col justify-between shadow-2xs hover:border-primary/10 transition-all">
          <CheckCircle2 className="h-5 w-5 text-green-500" />
          <div className="mt-4">
            <span className="text-2xl font-black text-foreground block">{fulfilledCount}</span>
            <span className="text-[9px] uppercase font-bold text-muted-foreground mt-0.5 block">Requests Fulfilled</span>
          </div>
        </div>

        {/* Pending hospital requests broadcast */}
        <div className="bg-card border border-border p-5 rounded-2xl flex flex-col justify-between shadow-2xs hover:border-primary/10 transition-all">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          <div className="mt-4">
            <span className="text-2xl font-black text-foreground block">{pendingCount}</span>
            <span className="text-[9px] uppercase font-bold text-muted-foreground mt-0.5 block">Pending Requests</span>
          </div>
        </div>
      </div>

      {/* Critical Stock Alert banners */}
      {lowStockAlerts.length > 0 && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl space-y-2 animate-in fade-in duration-200">
          <div className="flex items-center space-x-2 text-red-700">
            <AlertTriangle className="h-4.5 w-4.5 shrink-0" />
            <h4 className="text-xs font-bold">Critical Low Stock Warning ({lowStockAlerts.length} Groups)</h4>
          </div>
          <p className="text-[11px] text-red-600/90 leading-relaxed pl-6">
            The following blood groups have dropped below {LOW_STOCK_LIMIT} units:{" "}
            <strong>{lowStockAlerts.map((i) => `${i.bloodGroup} (${i.units} units)`).join(", ")}</strong>. Schedule a donation drive to replenish stocks immediately.
          </p>
        </div>
      )}

      {/* Core analytics split charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Inventory distribution chart */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-xs space-y-4 lg:col-span-2">
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center">
            <Database className="h-4.5 w-4.5 mr-2 text-primary" />
            Blood Inventory Distribution ({totalInventoryUnits} Total Units)
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {inventory.map((item) => {
              const isLow = item.units <= LOW_STOCK_LIMIT;
              const percent = totalInventoryUnits > 0 ? Math.round((item.units / totalInventoryUnits) * 100) : 0;

              return (
                <div
                  key={item.id}
                  className={`p-4 border rounded-xl flex flex-col justify-between space-y-2 text-center transition-all ${
                    isLow ? "bg-red-500/[0.02] border-red-500/15" : "bg-muted/10 border-border/80"
                  }`}
                >
                  <div className="h-8 w-8 rounded-lg bg-card border border-border flex items-center justify-center mx-auto text-primary shadow-3xs">
                    <Droplet className={`h-4.5 w-4.5 ${isLow ? "text-red-500 fill-red-500/10" : "text-primary"}`} />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-foreground block">{item.bloodGroup}</span>
                    <span className={`text-[10px] font-black mt-0.5 block ${isLow ? "text-red-600" : "text-muted-foreground"}`}>
                      {item.units} Units
                    </span>
                    <span className="text-[9px] text-muted-foreground/60 block">{percent}% share</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Monthly intake timeline */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center">
            <BarChart3 className="h-4.5 w-4.5 mr-2 text-primary" />
            Monthly Donations Intake (2026)
          </h3>

          {monthlyTimeline.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground text-xs italic">No donations received this year.</div>
          ) : (
            <div className="space-y-4">
              {monthlyTimeline.map((item) => (
                <div key={item.month} className="space-y-1">
                  <div className="flex justify-between text-[11px] font-semibold text-foreground">
                    <span>{item.month}</span>
                    <span>{item.units} Units</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-1.5">
                    <div
                      className="bg-primary h-1.5 rounded-full"
                      style={{ width: `${Math.min(100, item.units * 10)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
