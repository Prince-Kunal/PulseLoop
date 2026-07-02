"use client";

import {
  Building2,
  CheckCircle2,
  Clock,
  TrendingUp,
  Droplet,
  Calendar,
  AlertCircle,
  BarChart3
} from "lucide-react";

interface TimelineEvent {
  id: string;
  event: string;
  timestamp: string | Date;
}

interface BloodRequest {
  id: string;
  bloodGroup: string;
  unitsRequired: number;
  urgency: string;
  status: string;
  createdAt: string | Date;
  timeline: TimelineEvent[];
}

interface HospitalAnalyticsProps {
  requests: BloodRequest[];
}

export default function HospitalAnalytics({
  requests,
}: HospitalAnalyticsProps) {
  const totalRequests = requests.length;
  const fulfilledRequests = requests.filter((r) => r.status === "FULFILLED");
  const fulfilledCount = fulfilledRequests.length;
  const fulfillmentRate = totalRequests > 0 ? Math.round((fulfilledCount / totalRequests) * 100) : 0;

  // Calculate average fulfillment time in hours
  const calculateAverageFulfillmentTime = () => {
    if (fulfilledCount === 0) return "N/A";

    let totalHours = 0;
    let validCounts = 0;

    fulfilledRequests.forEach((req) => {
      const createdTime = new Date(req.createdAt).getTime();
      const fulfilledEvent = req.timeline.find((t) => t.event === "REQUEST_FULFILLED");

      if (fulfilledEvent) {
        const fulfilledTime = new Date(fulfilledEvent.timestamp).getTime();
        const diffMs = fulfilledTime - createdTime;
        totalHours += diffMs / (1000 * 60 * 60);
        validCounts++;
      }
    });

    if (validCounts === 0) return "N/A";
    const avg = totalHours / validCounts;
    return avg < 1 ? `${Math.round(avg * 60)} Mins` : `${avg.toFixed(1)} Hours`;
  };

  // Calculate most requested blood groups
  const getBloodGroupMetrics = () => {
    const counts: Record<string, number> = {};
    requests.forEach((r) => {
      counts[r.bloodGroup] = (counts[r.bloodGroup] || 0) + r.unitsRequired;
    });

    return Object.entries(counts)
      .map(([group, units]) => ({ group, units }))
      .sort((a, b) => b.units - a.units);
  };

  const groupMetrics = getBloodGroupMetrics();

  // Calculate monthly requests
  const getMonthlyRequests = () => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const counts = Array(12).fill(0);

    requests.forEach((r) => {
      const date = new Date(r.createdAt);
      if (date.getFullYear() === 2026) {
        counts[date.getMonth()] += 1;
      }
    });

    return months.map((m, idx) => ({
      month: m,
      count: counts[idx],
    })).filter((item, idx) => item.count > 0 || idx <= new Date().getMonth());
  };

  const monthlyTimeline = getMonthlyRequests();

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <span className="text-xs font-semibold uppercase tracking-wider text-primary">Insights & Demand</span>
        <h2 className="text-2xl font-bold text-foreground mt-1">Hospital Demand Analytics</h2>
        <p className="text-muted-foreground text-xs mt-1">
          Evaluate your clinical request rates, average provider response times, and blood inventory demand.
        </p>
      </div>

      {/* Grid: 4 stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Requests Raised */}
        <div className="bg-card border border-border p-5 rounded-2xl flex flex-col justify-between shadow-2xs hover:border-primary/10 transition-all">
          <Building2 className="h-5 w-5 text-primary" />
          <div className="mt-4">
            <span className="text-2xl font-black text-foreground block">{totalRequests}</span>
            <span className="text-[9px] uppercase font-bold text-muted-foreground mt-0.5 block">Requests Raised</span>
          </div>
        </div>

        {/* Requests Fulfilled */}
        <div className="bg-card border border-border p-5 rounded-2xl flex flex-col justify-between shadow-2xs hover:border-primary/10 transition-all">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          <div className="mt-4">
            <span className="text-2xl font-black text-foreground block">{fulfilledCount}</span>
            <span className="text-[9px] uppercase font-bold text-muted-foreground mt-0.5 block">Requests Fulfilled</span>
          </div>
        </div>

        {/* Average fulfillment duration */}
        <div className="bg-card border border-border p-5 rounded-2xl flex flex-col justify-between shadow-2xs hover:border-primary/10 transition-all">
          <Clock className="h-5 w-5 text-secondary" />
          <div className="mt-4">
            <span className="text-2xl font-black text-foreground block">{calculateAverageFulfillmentTime()}</span>
            <span className="text-[9px] uppercase font-bold text-muted-foreground mt-0.5 block">Avg. Fulfillment Duration</span>
          </div>
        </div>

        {/* Fulfillment Rate */}
        <div className="bg-card border border-border p-5 rounded-2xl flex flex-col justify-between shadow-2xs hover:border-primary/10 transition-all">
          <TrendingUp className="h-5 w-5 text-purple-600" />
          <div className="mt-4">
            <span className="text-2xl font-black text-foreground block">{fulfillmentRate}%</span>
            <span className="text-[9px] uppercase font-bold text-muted-foreground mt-0.5 block">Fulfillment Rate</span>
          </div>
        </div>
      </div>

      {/* Main split sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Requested groups */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-xs space-y-5">
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center">
            <Droplet className="h-4.5 w-4.5 mr-2 text-primary" />
            Demand Distribution by Blood Group
          </h3>

          {groupMetrics.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground text-xs italic">No blood groups requested.</div>
          ) : (
            <div className="space-y-4">
              {groupMetrics.map((item) => (
                <div key={item.group} className="space-y-1.5">
                  <div className="flex justify-between text-[11px] font-semibold text-foreground">
                    <span>Group: {item.group}</span>
                    <span>{item.units} Units</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full"
                      style={{ width: `${Math.min(100, (item.units / Math.max(...groupMetrics.map(g => g.units))) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Monthly Requests count */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-xs space-y-5">
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center">
            <BarChart3 className="h-4.5 w-4.5 mr-2 text-primary" />
            Monthly Emergency Requests Volume (2026)
          </h3>

          {monthlyTimeline.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground text-xs italic">No requests logged this year.</div>
          ) : (
            <div className="space-y-4">
              {monthlyTimeline.map((item) => (
                <div key={item.month} className="space-y-1">
                  <div className="flex justify-between text-[11px] font-semibold text-foreground">
                    <span>{item.month}</span>
                    <span>{item.count} Requests</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-1.5">
                    <div
                      className="bg-primary h-1.5 rounded-full"
                      style={{ width: `${Math.min(100, item.count * 15)}%` }}
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
