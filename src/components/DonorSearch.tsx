"use client";

import { useState } from "react";
import {
  Search,
  User,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Award,
  Gift,
  Heart,
  Droplet
} from "lucide-react";

interface DonorSearchProps {
  bloodBankId: string;
}

interface DonorProfile {
  id: string;
  fullName: string;
  bloodGroup: string;
  bloodGroupVerified: boolean;
  lastDonationDate: string | null;
  nextEligibleDate: string | null;
  totalDonations: number;
  livesImpacted: number;
  currentStreak: number;
  longestStreak: number;
}

interface RecordSuccessData {
  stats: {
    totalDonations: number;
    livesImpacted: number;
    currentStreak: number;
    longestStreak: number;
    nextEligibleDate: string;
  };
  unlockedBadges: Array<{ id: string; name: string; description: string; icon: string }>;
  unlockedRewards: Array<{ id: string; name: string; description: string; code: string }>;
}

export default function DonorSearch({ bloodBankId }: DonorSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [donor, setDonor] = useState<DonorProfile | null>(null);
  const [searchError, setSearchError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  // Donation recording states
  const [units, setUnits] = useState(1);
  const [isRecording, setIsRecording] = useState(false);
  const [recordError, setRecordError] = useState("");
  const [successData, setSuccessData] = useState<RecordSuccessData | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSearchError("");
    setDonor(null);
    setSuccessData(null);
    setRecordError("");
    setHasSearched(false);

    try {
      const res = await fetch(`/api/donors/search?query=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Search failed");
      }

      if (data.donor) {
        setDonor(data.donor);
      } else {
        setSearchError("No donor found with that email or phone number.");
      }
      setHasSearched(true);
    } catch (err: any) {
      setSearchError(err.message || "An unexpected error occurred.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleRecordDonation = async () => {
    if (!donor) return;

    setIsRecording(true);
    setRecordError("");
    setSuccessData(null);

    try {
      const res = await fetch("/api/donations/record", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          donorId: donor.id,
          bloodBankId,
          units,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to record donation");
      }

      setSuccessData(data);
      
      // Update local donor state with new stats
      setDonor((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          totalDonations: data.stats.totalDonations,
          livesImpacted: data.stats.livesImpacted,
          currentStreak: data.stats.currentStreak,
          longestStreak: data.stats.longestStreak,
          lastDonationDate: new Date().toISOString(),
          nextEligibleDate: data.stats.nextEligibleDate,
        };
      });

      // Refresh page data to update the live inventory
      window.location.reload();
    } catch (err: any) {
      setRecordError(err.message || "An unexpected error occurred while saving.");
    } finally {
      setIsRecording(false);
    }
  };

  // Determine eligibility
  const checkEligibility = () => {
    if (!donor) return { eligible: false, message: "" };
    if (!donor.nextEligibleDate) return { eligible: true, message: "Eligible to Donate" };
    
    const nextDate = new Date(donor.nextEligibleDate);
    const today = new Date();
    
    if (today >= nextDate) {
      return { eligible: true, message: "Eligible to Donate" };
    } else {
      return { 
        eligible: false, 
        message: `Ineligible until ${nextDate.toLocaleDateString()}` 
      };
    }
  };

  const eligibility = checkEligibility();

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-md space-y-6">
      <div>
        <h3 className="text-lg font-bold text-foreground">Search Donor & Record Donation</h3>
        <p className="text-muted-foreground text-xs mt-1">
          Retrieve donor profiles by email or phone number to verify eligibility and record blood intakes.
        </p>
      </div>

      {/* Search Input Box */}
      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-grow">
          <Search className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Enter donor email or phone number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-muted/30 border border-border rounded-xl text-sm placeholder-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
          />
        </div>
        <button
          type="submit"
          disabled={isSearching}
          className="px-5 py-3 bg-primary hover:bg-primary/95 text-primary-foreground font-semibold rounded-xl text-sm flex items-center justify-center transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
        >
          {isSearching ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Searching...
            </>
          ) : (
            "Search Donor"
          )}
        </button>
      </form>

      {/* Search Result Feedback */}
      {searchError && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center space-x-2 text-red-600 text-xs">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>{searchError}</span>
        </div>
      )}

      {hasSearched && !donor && !searchError && (
        <div className="text-center py-6 text-muted-foreground text-sm">
          No records found. Make sure the email or phone number matches exactly.
        </div>
      )}

      {/* Donor Card Display */}
      {donor && (
        <div className="border border-border rounded-2xl bg-muted/10 p-5 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
            <div className="flex items-center space-x-3.5">
              <div className="h-12 w-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <User className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-bold text-foreground text-base">{donor.fullName}</h4>
                <div className="flex items-center space-x-2 mt-0.5">
                  <span className="text-xs text-muted-foreground">Donor ID:</span>
                  <span className="text-xs font-mono font-medium text-foreground bg-muted px-1.5 py-0.5 rounded">
                    {donor.id.slice(-8).toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="bg-red-500/10 text-red-600 border border-red-500/20 px-3.5 py-1.5 rounded-xl flex items-center space-x-1.5">
                <Droplet className="h-4 w-4 fill-red-600 text-red-600" />
                <span className="text-sm font-extrabold">{donor.bloodGroup}</span>
              </div>
              <span
                className={`text-xs px-3 py-1.5 rounded-xl border font-bold ${
                  eligibility.eligible
                    ? "bg-green-500/10 border-green-500/20 text-green-600"
                    : "bg-amber-500/10 border-amber-500/20 text-amber-600"
                }`}
              >
                {eligibility.message}
              </span>
            </div>
          </div>

          {/* Statistics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-card border border-border p-3.5 rounded-xl shadow-xs">
              <span className="text-[10px] text-muted-foreground uppercase font-bold block">Last Donation</span>
              <span className="text-sm font-semibold text-foreground mt-1 block">
                {donor.lastDonationDate ? new Date(donor.lastDonationDate).toLocaleDateString() : "Never"}
              </span>
            </div>
            <div className="bg-card border border-border p-3.5 rounded-xl shadow-xs">
              <span className="text-[10px] text-muted-foreground uppercase font-bold block">Total Donations</span>
              <span className="text-sm font-semibold text-foreground mt-1 block">{donor.totalDonations}</span>
            </div>
            <div className="bg-card border border-border p-3.5 rounded-xl shadow-xs">
              <span className="text-[10px] text-muted-foreground uppercase font-bold block">Lives Impacted</span>
              <span className="text-sm font-semibold text-primary mt-1 block">{donor.livesImpacted}</span>
            </div>
            <div className="bg-card border border-border p-3.5 rounded-xl shadow-xs">
              <span className="text-[10px] text-muted-foreground uppercase font-bold block">Current Streak</span>
              <span className="text-sm font-semibold text-foreground mt-1 block">{donor.currentStreak} 🔥</span>
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-border">
            {/* Units Selection */}
            <div className="flex items-center space-x-3">
              <label htmlFor="units" className="text-sm font-semibold text-muted-foreground">
                Units to Donate:
              </label>
              <select
                id="units"
                value={units}
                onChange={(e) => setUnits(parseInt(e.target.value))}
                className="bg-card border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary/50 cursor-pointer shadow-xs"
              >
                <option value={1}>1 Unit</option>
                <option value={2}>2 Units</option>
                <option value={3}>3 Units</option>
              </select>
            </div>

            {/* Record Trigger Button */}
            <button
              onClick={handleRecordDonation}
              disabled={isRecording || !eligibility.eligible}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl text-sm flex items-center justify-center transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-red-500/10"
            >
              {isRecording ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Recording...
                </>
              ) : (
                "Record Donation"
              )}
            </button>
          </div>
        </div>
      )}

      {/* Record Error Message */}
      {recordError && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center space-x-2 text-red-600 text-xs">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>{recordError}</span>
        </div>
      )}

      {/* Donation Successful Banner */}
      {successData && (
        <div className="p-6 bg-green-500/5 border border-green-500/20 rounded-2xl space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-start space-x-3">
            <CheckCircle2 className="h-6 w-6 text-green-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-foreground text-base">Donation Recorded Successfully!</h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                The database, donor metrics, and inventory have been updated in real time.
              </p>
            </div>
          </div>

          {/* Gamification Unlocks */}
          {(successData.unlockedBadges.length > 0 || successData.unlockedRewards.length > 0) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {/* Badges Unlocked */}
              {successData.unlockedBadges.map((badge) => (
                <div key={badge.id} className="p-3.5 bg-yellow-500/10 border border-yellow-500/20 rounded-xl flex items-center space-x-3">
                  <div className="h-9 w-9 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-700">
                    <Award className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-yellow-600 font-bold block uppercase tracking-wider">Badge Unlocked!</span>
                    <span className="text-xs font-bold text-foreground mt-0.5 block">{badge.name}</span>
                  </div>
                </div>
              ))}

              {/* Rewards Unlocked */}
              {successData.unlockedRewards.map((reward) => (
                <div key={reward.id} className="p-3.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center space-x-3">
                  <div className="h-9 w-9 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-600">
                    <Gift className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[10px] text-indigo-600 font-bold block uppercase tracking-wider">Reward Earned!</span>
                    <span className="text-xs font-bold text-foreground mt-0.5 block">{reward.name}</span>
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
