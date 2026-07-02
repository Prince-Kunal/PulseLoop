"use client";

import { useState } from "react";
import {
  Trophy,
  Award,
  Zap,
  MapPin,
  TrendingUp,
  Filter,
  UserCheck,
  Heart
} from "lucide-react";

interface DonorRank {
  id: string;
  fullName: string;
  totalDonations: number;
  currentStreak: number;
  livesImpacted: number;
  city: string | null;
  state: string | null;
  badges: Array<{
    name: string;
  }>;
}

interface LeaderboardsConsoleProps {
  initialDonors: DonorRank[];
}

type TabType = "DONATIONS" | "STREAK" | "LIVES_IMPACTED";

export default function LeaderboardsConsole({
  initialDonors,
}: LeaderboardsConsoleProps) {
  const [activeTab, setActiveTab] = useState<TabType>("DONATIONS");
  const [selectedCity, setSelectedCity] = useState<string>("ALL");
  const [selectedState, setSelectedState] = useState<string>("ALL");

  // Get unique lists of cities and states for filter selects
  const cities = Array.from(
    new Set(initialDonors.map((d) => d.city).filter((c): c is string => c !== null))
  );
  const states = Array.from(
    new Set(initialDonors.map((d) => d.state).filter((s): s is string => s !== null))
  );

  // Apply filters
  const filteredDonors = initialDonors.filter((donor) => {
    const cityMatch = selectedCity === "ALL" || donor.city === selectedCity;
    const stateMatch = selectedState === "ALL" || donor.state === selectedState;
    return cityMatch && stateMatch;
  });

  // Sort and rank based on active tab
  const getSortedRanks = () => {
    switch (activeTab) {
      case "DONATIONS":
        return [...filteredDonors].sort((a, b) => b.totalDonations - a.totalDonations || b.livesImpacted - a.livesImpacted);
      case "STREAK":
        return [...filteredDonors].sort((a, b) => b.currentStreak - a.currentStreak || b.totalDonations - a.totalDonations);
      case "LIVES_IMPACTED":
        return [...filteredDonors].sort((a, b) => b.livesImpacted - a.livesImpacted || b.totalDonations - a.totalDonations);
      default:
        return filteredDonors;
    }
  };

  const sortedDonors = getSortedRanks();

  const getBadgeName = (donor: DonorRank) => {
    if (donor.badges.length > 0) {
      return donor.badges[0].name;
    }
    return "New Donor";
  };

  const getValueLabel = (donor: DonorRank) => {
    switch (activeTab) {
      case "DONATIONS":
        return `${donor.totalDonations} Units`;
      case "STREAK":
        return `${donor.currentStreak} 🔥`;
      case "LIVES_IMPACTED":
        return `${donor.livesImpacted} Lives`;
      default:
        return "";
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <span className="text-xs font-semibold uppercase tracking-wider text-primary">Community Standings</span>
        <h2 className="text-2xl font-bold text-foreground mt-1">Leaderboards</h2>
        <p className="text-muted-foreground text-xs mt-1">
          Honor and track local blood donors. Compete in donation count, current streak, or total lives impacted.
        </p>
      </div>

      {/* Ranks Tabs & Location Filters */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 bg-card border border-border p-4 rounded-2xl shadow-xs">
        {/* Sorting Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab("DONATIONS")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer ${
              activeTab === "DONATIONS"
                ? "bg-primary text-primary-foreground"
                : "bg-muted hover:bg-muted/80 text-muted-foreground"
            }`}
          >
            <Heart className="h-4 w-4" />
            <span>Most Donations</span>
          </button>
          <button
            onClick={() => setActiveTab("STREAK")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer ${
              activeTab === "STREAK"
                ? "bg-primary text-primary-foreground"
                : "bg-muted hover:bg-muted/80 text-muted-foreground"
            }`}
          >
            <Zap className="h-4 w-4" />
            <span>Highest Streak</span>
          </button>
          <button
            onClick={() => setActiveTab("LIVES_IMPACTED")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer ${
              activeTab === "LIVES_IMPACTED"
                ? "bg-primary text-primary-foreground"
                : "bg-muted hover:bg-muted/80 text-muted-foreground"
            }`}
          >
            <TrendingUp className="h-4 w-4" />
            <span>Lives Impacted</span>
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-1.5 text-xs text-muted-foreground">
            <Filter className="h-3.5 w-3.5 shrink-0" />
            <span>Filter:</span>
          </div>

          {/* City Selector */}
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="bg-muted border border-border rounded-xl px-3 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary cursor-pointer"
          >
            <option value="ALL">All Cities</option>
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>

          {/* State Selector */}
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="bg-muted border border-border rounded-xl px-3 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary cursor-pointer"
          >
            <option value="ALL">All States</option>
            {states.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Ranks List */}
      {sortedDonors.length === 0 ? (
        <div className="p-10 bg-card border border-border rounded-2xl text-center text-muted-foreground text-xs italic">
          No donors matching filters.
        </div>
      ) : (
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-muted/40 border-b border-border/80 text-muted-foreground font-semibold">
                  <th className="py-3 px-5 w-16 text-center">Rank</th>
                  <th className="py-3 px-4">Donor Name</th>
                  <th className="py-3 px-4">Badge</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-5 text-right font-black">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {sortedDonors.map((donor, idx) => {
                  const rank = idx + 1;

                  const getRankStyle = () => {
                    if (rank === 1) return "bg-amber-500/10 text-amber-600 border border-amber-500/20";
                    if (rank === 2) return "bg-slate-400/15 text-slate-700 border border-slate-400/25";
                    if (rank === 3) return "bg-orange-500/10 text-orange-600 border border-orange-500/20";
                    return "bg-muted text-muted-foreground";
                  };

                  return (
                    <tr key={donor.id} className="hover:bg-muted/10 transition-colors">
                      <td className="py-4 px-5 text-center">
                        <span className={`inline-flex h-6 w-6 rounded-md items-center justify-center text-[10px] font-bold ${getRankStyle()}`}>
                          {rank}
                        </span>
                      </td>
                      <td className="py-4 px-4 font-bold text-foreground">
                        {donor.fullName}
                      </td>
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center space-x-1 text-secondary text-[10px] font-semibold bg-secondary/5 border border-secondary/15 px-2 py-0.5 rounded">
                          <Award className="h-3 w-3 shrink-0" />
                          <span>{getBadgeName(donor)}</span>
                        </span>
                      </td>
                      <td className="py-4 px-4 text-muted-foreground flex items-center space-x-1 mt-0.5">
                        <MapPin className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0" />
                        <span>
                          {donor.city && donor.state ? `${donor.city}, ${donor.state}` : "Local Area"}
                        </span>
                      </td>
                      <td className="py-4 px-5 text-right font-black text-foreground text-sm">
                        {getValueLabel(donor)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
