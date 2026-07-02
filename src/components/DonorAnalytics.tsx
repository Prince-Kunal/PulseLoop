"use client";

import {
  Heart,
  Zap,
  TrendingUp,
  Award,
  Gift,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  BarChart3
} from "lucide-react";

interface Profile {
  id: string;
  fullName: string;
  bloodGroup: string;
  totalDonations: number;
  livesImpacted: number;
  currentStreak: number;
  longestStreak: number;
  lastDonationDate: string | Date | null;
  nextEligibleDate: string | Date | null;
}

interface Donation {
  id: string;
  donationDate: string | Date;
  units: number;
}

interface ResponseLog {
  id: string;
  response: string;
}

interface DonorAnalyticsProps {
  profile: Profile;
  history: Donation[];
  notificationsCount: number;
  responses: ResponseLog[];
  rewardsCount: number;
  badgesCount: number;
}

export default function DonorAnalytics({
  profile,
  history,
  notificationsCount,
  responses,
  rewardsCount,
  badgesCount,
}: DonorAnalyticsProps) {
  // Calculate average days between donations from history logs
  const calculateAverageInterval = () => {
    if (history.length < 2) return "N/A (Need 2+ donations)";
    
    let totalDiffDays = 0;
    for (let i = 0; i < history.length - 1; i++) {
      const date1 = new Date(history[i].donationDate);
      const date2 = new Date(history[i + 1].donationDate);
      const diffTime = Math.abs(date1.getTime() - date2.getTime());
      totalDiffDays += Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
    return `${Math.round(totalDiffDays / (history.length - 1))} Days`;
  };

  // Compile response rate details
  const acceptedResponses = responses.filter((r) => r.response === "AVAILABLE").length;
  const declinedResponses = responses.filter((r) => r.response === "UNAVAILABLE").length;
  const ignoredCount = Math.max(0, notificationsCount - responses.length);
  const responseRate = notificationsCount > 0 ? Math.round((acceptedResponses / notificationsCount) * 100) : 0;

  // Compile monthly donation counts
  const getMonthlyTimeline = () => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const counts = Array(12).fill(0);

    history.forEach((donation) => {
      const date = new Date(donation.donationDate);
      // Filter for current or recent year (2026)
      if (date.getFullYear() === 2026) {
        counts[date.getMonth()] += donation.units;
      }
    });

    return months.map((m, idx) => ({
      month: m,
      units: counts[idx],
    })).filter((item, idx) => item.units > 0 || idx <= new Date().getMonth());
  };

  const timeline = getMonthlyTimeline();

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <span className="text-xs font-semibold uppercase tracking-wider text-primary">Insights & Statistics</span>
        <h2 className="text-2xl font-bold text-foreground mt-1">Donor Analytics</h2>
        <p className="text-muted-foreground text-xs mt-1">
          Explore your lifetime contribution metrics, average donation frequency, and emergency response performance.
        </p>
      </div>

      {/* Grid: 6 stats overview */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Total Donations */}
        <div className="bg-card border border-border p-4 rounded-xl flex flex-col justify-between shadow-2xs hover:border-primary/10 transition-all">
          <Heart className="h-5 w-5 text-secondary shrink-0" />
          <div className="mt-4">
            <span className="text-2xl font-black text-foreground block">{profile.totalDonations}</span>
            <span className="text-[9px] uppercase font-bold text-muted-foreground mt-0.5 block">Total Donations</span>
          </div>
        </div>

        {/* Lives Impacted */}
        <div className="bg-card border border-border p-4 rounded-xl flex flex-col justify-between shadow-2xs hover:border-primary/10 transition-all">
          <TrendingUp className="h-5 w-5 text-primary shrink-0" />
          <div className="mt-4">
            <span className="text-2xl font-black text-foreground block">{profile.livesImpacted}</span>
            <span className="text-[9px] uppercase font-bold text-muted-foreground mt-0.5 block">Lives Impacted</span>
          </div>
        </div>

        {/* Current Streak */}
        <div className="bg-card border border-border p-4 rounded-xl flex flex-col justify-between shadow-2xs hover:border-primary/10 transition-all">
          <Zap className="h-5 w-5 text-amber-500 fill-amber-500/10 shrink-0" />
          <div className="mt-4">
            <span className="text-2xl font-black text-foreground block">{profile.currentStreak}🔥</span>
            <span className="text-[9px] uppercase font-bold text-muted-foreground mt-0.5 block">Current Streak</span>
          </div>
        </div>

        {/* Longest Streak */}
        <div className="bg-card border border-border p-4 rounded-xl flex flex-col justify-between shadow-2xs hover:border-primary/10 transition-all">
          <Zap className="h-5 w-5 text-amber-600 shrink-0" />
          <div className="mt-4">
            <span className="text-2xl font-black text-foreground block">{profile.longestStreak}🔥</span>
            <span className="text-[9px] uppercase font-bold text-muted-foreground mt-0.5 block">Longest Streak</span>
          </div>
        </div>

        {/* Rewards Earned */}
        <div className="bg-card border border-border p-4 rounded-xl flex flex-col justify-between shadow-2xs hover:border-primary/10 transition-all">
          <Gift className="h-5 w-5 text-indigo-500 shrink-0" />
          <div className="mt-4">
            <span className="text-2xl font-black text-foreground block">{rewardsCount}</span>
            <span className="text-[9px] uppercase font-bold text-muted-foreground mt-0.5 block">Rewards Claimed</span>
          </div>
        </div>

        {/* Badges Earned */}
        <div className="bg-card border border-border p-4 rounded-xl flex flex-col justify-between shadow-2xs hover:border-primary/10 transition-all">
          <Award className="h-5 w-5 text-purple-500 shrink-0" />
          <div className="mt-4">
            <span className="text-2xl font-black text-foreground block">{badgesCount}</span>
            <span className="text-[9px] uppercase font-bold text-muted-foreground mt-0.5 block">Badges Earned</span>
          </div>
        </div>
      </div>

      {/* Main split sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Donation Timeline Visualizer */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center">
            <BarChart3 className="h-4.5 w-4.5 mr-2 text-primary" />
            Donation Activity Timeline (2026)
          </h3>

          {timeline.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground text-xs italic">
              No donations registered during this calendar year.
            </div>
          ) : (
            <div className="space-y-4">
              {timeline.map((item) => (
                <div key={item.month} className="space-y-1.5">
                  <div className="flex justify-between text-[11px] font-semibold text-foreground">
                    <span>{item.month}</span>
                    <span>{item.units} Units</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full"
                      style={{ width: `${Math.min(100, item.units * 20)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Blood Donation Summary */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center">
            <Heart className="h-4.5 w-4.5 mr-2 text-secondary fill-secondary/15" />
            Blood Donation Metrics
          </h3>

          <div className="divide-y divide-border/60 text-xs">
            <div className="py-3 flex justify-between">
              <span className="text-muted-foreground">Blood Group Type</span>
              <span className="font-bold text-foreground">{profile.bloodGroup}</span>
            </div>
            <div className="py-3 flex justify-between">
              <span className="text-muted-foreground">Units Contributed</span>
              <span className="font-bold text-foreground">{profile.totalDonations} Units</span>
            </div>
            <div className="py-3 flex justify-between">
              <span className="text-muted-foreground">Avg. Donation Interval Frequency</span>
              <span className="font-bold text-foreground">{calculateAverageInterval()}</span>
            </div>
            <div className="py-3 flex justify-between">
              <span className="text-muted-foreground">Last Donation Date</span>
              <span className="font-bold text-foreground">
                {profile.lastDonationDate ? new Date(profile.lastDonationDate).toLocaleDateString() : "Never"}
              </span>
            </div>
            <div className="py-3 flex justify-between">
              <span className="text-muted-foreground">Next Eligibility Date</span>
              <span className="font-bold text-green-600 dark:text-green-400">
                {profile.nextEligibleDate ? new Date(profile.nextEligibleDate).toLocaleDateString() : "Eligible"}
              </span>
            </div>
          </div>
        </div>

        {/* Emergency Response Stats */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-xs space-y-4 lg:col-span-2">
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center">
            <AlertTriangle className="h-4.5 w-4.5 mr-2 text-secondary animate-pulse" />
            Emergency Broadcast Response Performance
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-2">
            <div className="p-4 bg-muted/20 border border-border rounded-xl text-center">
              <span className="block text-[10px] uppercase font-bold text-muted-foreground">Received Alerts</span>
              <span className="text-lg font-black text-foreground mt-1 block">{notificationsCount}</span>
            </div>
            <div className="p-4 bg-green-500/5 border border-green-500/10 rounded-xl text-center text-green-600">
              <span className="block text-[10px] uppercase font-bold text-muted-foreground">Accepted (Available)</span>
              <span className="text-lg font-black mt-1 block">{acceptedResponses}</span>
            </div>
            <div className="p-4 bg-red-500/5 border border-red-500/10 rounded-xl text-center text-red-600">
              <span className="block text-[10px] uppercase font-bold text-muted-foreground">Declined (Unavailable)</span>
              <span className="text-lg font-black mt-1 block">{declinedResponses}</span>
            </div>
            <div className="p-4 bg-primary/5 border border-primary/10 rounded-xl text-center text-primary">
              <span className="block text-[10px] uppercase font-bold text-muted-foreground">Response Rate</span>
              <span className="text-lg font-black mt-1 block">{responseRate}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
