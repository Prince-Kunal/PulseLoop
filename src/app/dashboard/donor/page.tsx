import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import DashboardShell from "@/components/DashboardShell";
import {
  Calendar,
  Heart,
  Award,
  Zap,
  MapPin,
  AlertTriangle,
  Clock,
  ChevronRight,
  TrendingUp,
  UserCheck,
  Activity
} from "lucide-react";

export default async function DonorDashboard() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
  }

  // Get the donor's profile details
  const donorProfile = await prisma.donorProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!donorProfile) {
    redirect("/auth/signin");
  }

  // Get current hour to determine greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";
  const firstName = donorProfile.fullName.split(" ")[0];

  // Placeholder calculations for eligibility
  // Standard interval: 56 days (8 weeks)
  const isEligible = !donorProfile.lastDonationDate;
  const daysRemaining = 42; // Example static countdown if not eligible

  return (
    <DashboardShell
      role="DONOR"
      userEmail={session.user.email}
      userName={donorProfile.fullName}
    >
      <div className="space-y-8">
        {/* Welcome Banner */}
        <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 to-slate-900 p-8 shadow-lg">
          <div className="absolute right-0 top-0 -mr-6 -mt-6 w-36 h-36 rounded-full bg-primary/10 blur-xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                Welcome Back
              </span>
              <h1 className="text-3xl font-bold tracking-tight text-white mt-1">
                {greeting}, {firstName}!
              </h1>
              <p className="text-slate-400 mt-2 max-w-xl text-sm leading-relaxed">
                Thank you for being part of the PulseLoop lifesaver network. Your willingness to donate helps hospitals respond instantly to emergency needs.
              </p>
            </div>
            <div className="bg-slate-950/40 border border-slate-800 rounded-xl px-5 py-3.5 self-start md:self-auto shrink-0 flex items-center space-x-3">
              <span className="text-xs text-slate-400">Verified Blood Group:</span>
              <span className="inline-flex items-center justify-center px-3 py-1 rounded-lg bg-secondary/10 border border-secondary/20 text-secondary font-bold text-lg">
                {donorProfile.bloodGroup}
              </span>
            </div>
          </div>
        </div>

        {/* Top Section: Eligibility and Core Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Eligibility Card */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between shadow-md relative overflow-hidden group">
            <div className="absolute right-0 top-0 w-24 h-24 rounded-full bg-secondary/5 group-hover:bg-secondary/10 blur-xl transition-all" />
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
                  Donation Eligibility
                </h3>
                {isEligible ? (
                  <span className="relative flex h-3.5 w-3.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-primary"></span>
                  </span>
                ) : (
                  <Clock className="h-5 w-5 text-amber-400" />
                )}
              </div>

              {isEligible ? (
                <div className="mt-5">
                  <div className="flex items-center space-x-2.5">
                    <UserCheck className="h-7 w-7 text-primary" />
                    <span className="text-2xl font-bold text-white">Eligible to Donate</span>
                  </div>
                  <p className="text-slate-400 text-xs mt-3 leading-relaxed">
                    You can donate blood immediately. Check the emergency requests below or find a nearby drive!
                  </p>
                </div>
              ) : (
                <div className="mt-5">
                  <div className="flex items-baseline space-x-2">
                    <span className="text-4xl font-extrabold text-white">{daysRemaining}</span>
                    <span className="text-sm font-semibold text-slate-400">days left</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5 mt-3">
                    <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: "60%" }}></div>
                  </div>
                  <p className="text-slate-500 text-xs mt-3 leading-relaxed">
                    Next eligibility date: July 19, 2026. Blood donation requires a standard 56-day gap to ensure your health and recovery.
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6">
              <button className="w-full py-2.5 px-4 text-xs font-semibold rounded-xl border border-primary/30 text-primary hover:bg-primary/10 transition-all cursor-pointer">
                View Health Recommendations
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="lg:col-span-2 grid grid-cols-2 gap-4">
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 shadow-sm hover:border-slate-700 transition-all flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Donations</span>
                <Heart className="h-5 w-5 text-secondary" />
              </div>
              <div className="mt-4">
                <span className="text-3xl font-bold text-white">12</span>
                <p className="text-slate-500 text-xs mt-1">Whole blood donation units</p>
              </div>
            </div>

            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 shadow-sm hover:border-slate-700 transition-all flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Lives Impacted</span>
                <Activity className="h-5 w-5 text-primary" />
              </div>
              <div className="mt-4">
                <span className="text-3xl font-bold text-white">36</span>
                <p className="text-slate-500 text-xs mt-1">Calculated: 3 lives per unit</p>
              </div>
            </div>

            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 shadow-sm hover:border-slate-700 transition-all flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Donation Streak</span>
                <Zap className="h-5 w-5 text-amber-500 fill-amber-500/10" />
              </div>
              <div className="mt-4">
                <span className="text-3xl font-bold text-white">4🔥</span>
                <p className="text-slate-500 text-xs mt-1">Consecutive cycles</p>
              </div>
            </div>

            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 shadow-sm hover:border-slate-700 transition-all flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Badges Earned</span>
                <Award className="h-5 w-5 text-indigo-400" />
              </div>
              <div className="mt-4 flex flex-wrap gap-1.5">
                <span className="inline-flex px-2 py-0.5 rounded-lg bg-secondary/10 text-secondary border border-secondary/20 text-[10px] font-semibold">Life Saver</span>
                <span className="inline-flex px-2 py-0.5 rounded-lg bg-primary/10 text-primary border border-primary/20 text-[10px] font-semibold">Elite Hero</span>
                <span className="inline-flex px-2 py-0.5 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[10px] font-semibold">Pioneer</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section: Active Requests, Drives & Community */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Emergency Requests (Only if eligible, placeholder UI) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 shadow-md">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-white flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2 text-secondary animate-pulse" />
                  Urgent Emergency Requests
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-secondary/10 border border-secondary/20 text-secondary text-xs font-semibold">
                  Live Matches
                </span>
              </div>

              {isEligible ? (
                <div className="space-y-4">
                  {/* Match 1 */}
                  <div className="p-4 border border-secondary/20 hover:border-secondary/40 bg-secondary/5 rounded-xl flex items-center justify-between transition-all">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-semibold text-white">St. Mary General Hospital</span>
                        <span className="inline-flex text-[10px] px-1.5 py-0.5 bg-secondary/20 text-secondary border border-secondary/30 rounded font-semibold">CRITICAL</span>
                      </div>
                      <p className="text-slate-400 text-xs flex items-center">
                        <MapPin className="h-3 w-3 mr-1 text-slate-500" />
                        2.4 km away
                      </p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <span className="text-xs text-slate-500 block">Needs</span>
                        <span className="text-lg font-bold text-secondary">{donorProfile.bloodGroup}</span>
                      </div>
                      <button className="px-4 py-2 bg-secondary hover:bg-secondary/90 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer">
                        Accept Request
                      </button>
                    </div>
                  </div>

                  {/* Match 2 */}
                  <div className="p-4 border border-slate-800 bg-slate-950/20 rounded-xl flex items-center justify-between transition-all">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-semibold text-white">Red Cross Emergency Hub</span>
                        <span className="inline-flex text-[10px] px-1.5 py-0.5 bg-slate-800 text-slate-400 border border-slate-700 rounded font-semibold">URGENT</span>
                      </div>
                      <p className="text-slate-400 text-xs flex items-center">
                        <MapPin className="h-3 w-3 mr-1 text-slate-500" />
                        4.1 km away
                      </p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <span className="text-xs text-slate-500 block">Needs</span>
                        <span className="text-lg font-bold text-secondary">{donorProfile.bloodGroup}</span>
                      </div>
                      <button className="px-4 py-2 bg-slate-850 hover:bg-slate-800 text-slate-200 rounded-lg text-xs font-semibold transition-colors cursor-pointer">
                        Accept Request
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 bg-slate-950/20 border border-slate-800 border-dashed rounded-xl">
                  <Clock className="h-10 w-10 text-slate-600 mx-auto mb-2" />
                  <h4 className="text-sm font-semibold text-slate-300">Emergency requests hidden</h4>
                  <p className="text-slate-500 text-xs max-w-sm mx-auto mt-1">
                    Emergency alerts are only shown when you are active and eligible to donate.
                  </p>
                </div>
              )}
            </div>

            {/* Nearby Donation Drives (within 5 km) */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 shadow-md">
              <h3 className="text-lg font-bold text-white flex items-center mb-5">
                <Calendar className="h-5 w-5 mr-2 text-primary" />
                Nearby Donation Drives (within 5 km)
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 border border-slate-800 bg-slate-950/25 rounded-xl hover:border-slate-700 transition-all">
                  <span className="inline-flex text-[10px] px-2 py-0.5 bg-secondary/10 border border-secondary/20 text-secondary rounded-lg font-semibold mb-2">Tomorrow</span>
                  <h4 className="text-sm font-bold text-white truncate">Annual Summer Blood Drive</h4>
                  <p className="text-slate-400 text-xs mt-1.5 flex items-center">
                    <MapPin className="h-3 w-3 mr-1 text-slate-500" />
                    City Center Plaza (1.2 km)
                  </p>
                  <p className="text-slate-500 text-xs mt-1 flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    9:00 AM - 4:00 PM
                  </p>
                </div>

                <div className="p-4 border border-slate-800 bg-slate-950/25 rounded-xl hover:border-slate-700 transition-all">
                  <span className="inline-flex text-[10px] px-2 py-0.5 bg-slate-800 border border-slate-700 text-slate-400 rounded-lg font-semibold mb-2">June 12, 2026</span>
                  <h4 className="text-sm font-bold text-white truncate">Metro Community College Drive</h4>
                  <p className="text-slate-400 text-xs mt-1.5 flex items-center">
                    <MapPin className="h-3 w-3 mr-1 text-slate-500" />
                    Campus Gym (3.5 km)
                  </p>
                  <p className="text-slate-500 text-xs mt-1 flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    10:00 AM - 5:00 PM
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Community Section: Leaderboard and Posts */}
          <div className="space-y-6">
            {/* Leaderboard Card */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 shadow-md">
              <h3 className="text-base font-bold text-white flex items-center mb-4">
                <TrendingUp className="h-4.5 w-4.5 mr-2 text-primary" />
                Community Leaderboard
              </h3>

              <div className="space-y-3">
                {[
                  { rank: 1, name: "Prince Kunal", donations: 14, points: 1420 },
                  { rank: 2, name: "Sarah Jenkins", donations: 12, points: 1210 },
                  { rank: 3, name: "John Doe", donations: 9, points: 940 },
                  { rank: 4, name: "Kunal Patel", donations: 8, points: 810 },
                ].map((item) => (
                  <div key={item.rank} className="flex items-center justify-between py-1.5 border-b border-slate-800/60 last:border-0">
                    <div className="flex items-center space-x-2.5">
                      <span className={`h-5 w-5 rounded-md flex items-center justify-center text-[10px] font-bold ${
                        item.rank === 1
                          ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          : item.rank === 2
                          ? "bg-slate-400/10 text-slate-300 border border-slate-400/20"
                          : "bg-slate-800 text-slate-400"
                      }`}>
                        {item.rank}
                      </span>
                      <span className="text-xs font-medium text-slate-300">{item.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-semibold text-white block">{item.points} pts</span>
                      <span className="text-[10px] text-slate-500">{item.donations} donations</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Posts / Activity Card */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 shadow-md">
              <h3 className="text-base font-bold text-white flex items-center mb-4">
                <Award className="h-4.5 w-4.5 mr-2 text-primary" />
                Community Activity
              </h3>

              <div className="space-y-4">
                <div className="p-3 bg-slate-950/20 border border-slate-800/80 rounded-xl space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">St. Mary Blood Center</span>
                    <span className="text-[9px] text-slate-500">2h ago</span>
                  </div>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    🎉 Big thanks to everyone who came out to today's drive. We collected 42 units of blood!
                  </p>
                </div>

                <div className="p-3 bg-slate-950/20 border border-slate-800/80 rounded-xl space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">Sarah Jenkins</span>
                    <span className="text-[9px] text-slate-500">1d ago</span>
                  </div>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    Just completed my 12th donation! Feels great to give back and help save lives ❤️
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
