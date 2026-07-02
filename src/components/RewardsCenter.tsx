"use client";

import { useState } from "react";
import {
  Gift,
  Award,
  Zap,
  CheckCircle2,
  Lock,
  ArrowRight,
  TrendingUp,
  Ticket,
  Clock,
  Coins
} from "lucide-react";

interface Donor {
  id: string;
  fullName: string;
  totalDonations: number;
}

interface Reward {
  id: string;
  name: string;
  description: string;
  pointsCost: number;
  code: string;
}

interface RedeemedReward {
  id: string;
  status: string;
  createdAt: string | Date;
  reward: Reward;
}

interface RewardsCenterProps {
  donorProfile: Donor;
  allRewards: Reward[];
  redeemedHistory: RedeemedReward[];
}

export default function RewardsCenter({
  donorProfile,
  allRewards,
  redeemedHistory,
}: RewardsCenterProps) {
  const [activeTab, setActiveTab] = useState<"MILESTONES" | "STORE" | "HISTORY">("MILESTONES");

  const totalDonations = donorProfile.totalDonations;
  
  // Calculate milestone details
  const milestones = [1, 3, 5, 10, 15, 20];
  
  const getNextMilestone = () => {
    const next = milestones.find((m) => m > totalDonations);
    return next || 25; // fallback
  };

  const getPreviousMilestone = () => {
    const passed = [...milestones].reverse().find((m) => m <= totalDonations);
    return passed || 0;
  };

  const nextMilestone = getNextMilestone();
  const prevMilestone = getPreviousMilestone();
  
  // Calculate percentage progress toward next milestone
  const range = nextMilestone - prevMilestone;
  const currentOffset = totalDonations - prevMilestone;
  const progressPercent = Math.min(100, Math.round((currentOffset / range) * 100));

  // Points conversion: e.g. each donation awards 100 points
  const pointsTotal = totalDonations * 100;
  const pointsSpent = redeemedHistory.length * 100; // simple points accounting
  const pointsAvailable = Math.max(0, pointsTotal - pointsSpent);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">Donor Benefits</span>
          <h2 className="text-2xl font-bold text-foreground mt-1">Rewards Center</h2>
          <p className="text-muted-foreground text-xs mt-1">
            Redeem vouchers, track milestone targets, and check your digital coupon history.
          </p>
        </div>

        {/* Points Display */}
        <div className="bg-card border border-border px-5 py-3.5 rounded-2xl flex items-center space-x-3.5 self-start sm:self-auto shrink-0 shadow-xs">
          <div className="h-9 w-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
            <Coins className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-muted-foreground uppercase font-bold block">Available Points</span>
            <span className="text-lg font-black text-foreground">{pointsAvailable} Points</span>
          </div>
        </div>
      </div>

      {/* Center Tabs */}
      <div className="flex border-b border-border">
        <button
          onClick={() => setActiveTab("MILESTONES")}
          className={`pb-3 px-4 text-xs font-semibold border-b-2 cursor-pointer transition-all ${
            activeTab === "MILESTONES"
              ? "border-primary text-foreground font-bold"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Milestone Progress
        </button>
        <button
          onClick={() => setActiveTab("STORE")}
          className={`pb-3 px-4 text-xs font-semibold border-b-2 cursor-pointer transition-all ${
            activeTab === "STORE"
              ? "border-primary text-foreground font-bold"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Redeem Store
        </button>
        <button
          onClick={() => setActiveTab("HISTORY")}
          className={`pb-3 px-4 text-xs font-semibold border-b-2 cursor-pointer transition-all ${
            activeTab === "HISTORY"
              ? "border-primary text-foreground font-bold"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          My Coupons ({redeemedHistory.length})
        </button>
      </div>

      {/* Tab contents */}
      {activeTab === "MILESTONES" && (
        <div className="space-y-6">
          {/* Milestone progress card */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-foreground">Next Milestone Progress</h3>
                <span className="text-[11px] text-muted-foreground mt-0.5 block">
                  You have completed <strong>{totalDonations} donations</strong>.
                </span>
              </div>
              <div className="bg-muted px-3 py-1.5 rounded-lg text-xs font-bold text-foreground">
                Next Target: {nextMilestone} Donations
              </div>
            </div>

            {/* Progress bar */}
            <div className="space-y-2">
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>{prevMilestone} Donations</span>
                <span>{progressPercent}% towards next milestone</span>
                <span>{nextMilestone} Donations</span>
              </div>
            </div>
          </div>

          {/* Suggested Milestones Grid */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-foreground flex items-center">
              <Award className="h-5 w-5 mr-2 text-primary" />
              PulseLoop Suggested Milestones
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {milestones.map((m) => {
                const isPassed = totalDonations >= m;
                const isNext = m === nextMilestone;

                return (
                  <div
                    key={m}
                    className={`bg-card border rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4 ${
                      isPassed
                        ? "border-green-500/20 bg-green-500/[0.02]"
                        : isNext
                        ? "border-primary/20 bg-primary/[0.02] ring-1 ring-primary/10"
                        : "border-border"
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <span className={`text-[10px] px-2.5 py-0.5 rounded-lg border font-bold ${
                          isPassed
                            ? "bg-green-500/10 border-green-500/20 text-green-600"
                            : isNext
                            ? "bg-primary/10 border-primary/20 text-primary"
                            : "bg-slate-100 border-slate-200 text-slate-500"
                        }`}>
                          {m} {m === 1 ? "Donation" : "Donations"}
                        </span>
                        {isPassed && <CheckCircle2 className="h-4.5 w-4.5 text-green-600 shrink-0" />}
                        {!isPassed && isNext && <Clock className="h-4.5 w-4.5 text-primary shrink-0 animate-spin" />}
                      </div>
                      <h4 className="text-xs font-bold text-foreground">
                        {isPassed ? "Milestone Unlocked" : (isNext ? "Active Milestone Goal" : "Upcoming Goal")}
                      </h4>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                        {isPassed
                          ? "Congratulations! You have completed this milestone stage."
                          : `Complete ${m - totalDonations} more donations to unlock this milestone.`}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {activeTab === "STORE" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {allRewards.map((reward) => {
              const isAffordable = pointsAvailable >= reward.pointsCost;

              return (
                <div
                  key={reward.id}
                  className={`bg-card border rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4 ${
                    isAffordable ? "border-primary/15 hover:border-primary/30" : "border-border opacity-70"
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <div className="h-9 w-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                        <Gift className="h-5 w-5" />
                      </div>
                      <span className="text-xs font-black text-primary bg-primary/5 px-2.5 py-1 rounded-xl">
                        {reward.pointsCost} Points
                      </span>
                    </div>

                    <h4 className="text-sm font-extrabold text-foreground">{reward.name}</h4>
                    <p className="text-muted-foreground text-xs leading-relaxed">
                      {reward.description}
                    </p>
                  </div>

                  <div className="pt-2">
                    {isAffordable ? (
                      <button className="w-full py-2 bg-primary hover:bg-primary/95 text-primary-foreground font-semibold rounded-xl text-xs flex items-center justify-center space-x-1.5 cursor-pointer shadow-xs transition-all">
                        <span>Redeem Voucher</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    ) : (
                      <button
                        disabled
                        className="w-full py-2 bg-muted text-muted-foreground font-semibold rounded-xl text-xs flex items-center justify-center space-x-1.5 cursor-not-allowed"
                      >
                        <Lock className="h-3.5 w-3.5" />
                        <span>Insufficient Points</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === "HISTORY" && (
        <div className="space-y-6">
          {redeemedHistory.length === 0 ? (
            <div className="p-10 border border-dashed border-border rounded-2xl text-center text-muted-foreground text-xs italic">
              No rewards redeemed yet. Reach milestones to earn points and claim coupons!
            </div>
          ) : (
            <div className="space-y-4">
              {redeemedHistory.map((item) => (
                <div
                  key={item.id}
                  className="bg-card border border-border p-5 rounded-2xl shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center space-x-2">
                      <Ticket className="h-4.5 w-4.5 text-secondary shrink-0" />
                      <span className="font-bold text-foreground text-xs">{item.reward.name}</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground block pl-6">
                      Redeemed on: {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center space-x-4 pl-6 sm:pl-0">
                    <div className="text-right shrink-0">
                      <span className="text-[9px] text-muted-foreground block uppercase font-bold">Voucher Code</span>
                      <span className="text-xs font-mono font-black text-secondary">{item.reward.code}</span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded bg-green-500/10 border border-green-500/20 text-green-600 text-[10px] font-bold">
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
