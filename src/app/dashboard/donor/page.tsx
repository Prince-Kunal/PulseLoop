import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import DashboardShell from "@/components/DashboardShell";
import DonorEmergencyAlerts from "@/components/DonorEmergencyAlerts";
import {
  Calendar,
  Heart,
  Award,
  Zap,
  MapPin,
  Clock,
  TrendingUp,
  UserCheck,
  Activity
} from "lucide-react";

// Haversine distance helper
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) *
      Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export default async function DonorDashboard() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
  }

  // Get donor profile and related badges
  const donorProfile = await prisma.donorProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      badges: true,
    },
  });

  if (!donorProfile) {
    redirect("/auth/signin");
  }

  // greeting calculation
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";
  const firstName = donorProfile.fullName.split(" ")[0];

  // Eligibility calculation
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const isEligible = !donorProfile.nextEligibleDate || new Date(donorProfile.nextEligibleDate) <= today;
  let daysRemaining = 0;
  if (!isEligible && donorProfile.nextEligibleDate) {
    const diffTime = new Date(donorProfile.nextEligibleDate).getTime() - today.getTime();
    daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  }

  // Fetch active notifications
  const dbNotifications = await prisma.notification.findMany({
    where: {
      donorId: donorProfile.id,
      status: "SENT",
      bloodRequest: {
        status: {
          in: ["PENDING", "ACCEPTED", "IN_PROGRESS"],
        },
      },
    },
    include: {
      bloodRequest: {
        select: {
          id: true,
          bloodGroup: true,
          unitsRequired: true,
          urgency: true,
          createdAt: true,
        },
      },
      hospital: {
        select: {
          id: true,
          hospitalName: true,
          latitude: true,
          longitude: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Map and calculate distance
  const alerts = dbNotifications.map((notif) => {
    const distance = getDistance(
      donorProfile.latitude,
      donorProfile.longitude,
      notif.hospital.latitude,
      notif.hospital.longitude
    );

    return {
      id: notif.id,
      bloodRequestId: notif.bloodRequestId,
      hospitalId: notif.hospitalId,
      title: notif.title,
      message: notif.message,
      status: notif.status,
      createdAt: notif.createdAt,
      distance,
      bloodRequest: {
        id: notif.bloodRequest.id,
        bloodGroup: notif.bloodRequest.bloodGroup,
        unitsRequired: notif.bloodRequest.unitsRequired,
        urgency: notif.bloodRequest.urgency,
        createdAt: notif.bloodRequest.createdAt,
      },
      hospital: {
        id: notif.hospital.id,
        hospitalName: notif.hospital.hospitalName,
      },
    };
  });

  // Query nearby blood drives (within 20 km)
  const nearbyDrives = await prisma.bloodDrive.findMany({
    where: {
      date: {
        gte: today,
      },
    },
    take: 4,
    orderBy: { date: "asc" },
  });

  const drivesWithDistance = nearbyDrives.map((drive) => {
    const distance = getDistance(
      donorProfile.latitude,
      donorProfile.longitude,
      drive.latitude,
      drive.longitude
    );
    return { ...drive, distance };
  }).filter(d => d.distance <= 20); // filter to 20km

  return (
    <DashboardShell
      role="DONOR"
      userEmail={session.user.email}
      userName={donorProfile.fullName}
    >
      <div className="space-y-8">
        {/* Welcome Banner */}
        <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/15 via-background to-secondary/15 p-8 shadow-md">
          <div className="absolute right-0 top-0 -mr-6 -mt-6 w-36 h-36 rounded-full bg-primary/10 blur-xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                Welcome Back
              </span>
              <h1 className="text-3xl font-bold tracking-tight text-foreground mt-1">
                {greeting}, {firstName}!
              </h1>
              <p className="text-muted-foreground mt-2 max-w-xl text-sm leading-relaxed">
                Thank you for being part of the PulseLoop lifesaver network. Your willingness to donate helps hospitals respond instantly to emergency needs.
              </p>
            </div>
            <div className="bg-card border border-border rounded-xl px-5 py-3.5 self-start md:self-auto shrink-0 flex items-center space-x-3 shadow-xs">
              <span className="text-xs text-muted-foreground">Verified Blood Group:</span>
              <span className="inline-flex items-center justify-center px-3 py-1 rounded-lg bg-secondary/10 border border-secondary/20 text-secondary font-bold text-lg">
                {donorProfile.bloodGroup}
              </span>
            </div>
          </div>
        </div>

        {/* Top Section: Eligibility and Core Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Eligibility Card */}
          <div className="bg-card border border-border rounded-2xl p-6 flex flex-col justify-between shadow-xs relative overflow-hidden group">
            <div className="absolute right-0 top-0 w-24 h-24 rounded-full bg-secondary/5 group-hover:bg-secondary/10 blur-xl transition-all" />
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-muted-foreground/95 uppercase tracking-wider">
                  Donation Eligibility
                </h3>
                {isEligible ? (
                  <span className="relative flex h-3.5 w-3.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
                  </span>
                ) : (
                  <Clock className="h-5 w-5 text-amber-500" />
                )}
              </div>

              {isEligible ? (
                <div className="mt-5">
                  <div className="flex items-center space-x-2.5">
                    <UserCheck className="h-7 w-7 text-emerald-500" />
                    <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">Eligible to Donate</span>
                  </div>
                  <p className="text-muted-foreground text-xs mt-3 leading-relaxed">
                    You can donate blood immediately. Check the emergency requests below or find a nearby drive!
                  </p>
                </div>
              ) : (
                <div className="mt-5">
                  <div className="flex items-baseline space-x-2">
                    <span className="text-4xl font-extrabold text-foreground">{daysRemaining}</span>
                    <span className="text-sm font-semibold text-muted-foreground">days left</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-1.5 mt-3">
                    <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: `${Math.min(100, Math.round((56 - daysRemaining) / 56 * 100))}%` }}></div>
                  </div>
                  <p className="text-muted-foreground/80 text-xs mt-3 leading-relaxed">
                    Next eligibility date: {new Date(donorProfile.nextEligibleDate!).toLocaleDateString()}. Blood donation requires a standard 56-day gap to ensure your health and recovery.
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6">
              <button className="w-full py-2.5 px-4 text-xs font-semibold rounded-xl border border-sky-200 text-black bg-sky-100 hover:bg-sky-200/85 transition-all cursor-pointer">
                View Health Recommendations
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="lg:col-span-2 grid grid-cols-2 gap-4">
            <div className="bg-card border border-border rounded-2xl p-5 shadow-xs hover:border-primary/20 transition-all flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Donations</span>
                <Heart className="h-5 w-5 text-secondary" />
              </div>
              <div className="mt-4">
                <span className="text-3xl font-bold text-foreground">{donorProfile.totalDonations}</span>
                <p className="text-muted-foreground text-xs mt-1">Whole blood donation units</p>
              </div>
            </div>

            <div className="bg-card border border-border rounded-2xl p-5 shadow-xs hover:border-primary/20 transition-all flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Lives Impacted</span>
                <Activity className="h-5 w-5 text-primary" />
              </div>
              <div className="mt-4">
                <span className="text-3xl font-bold text-foreground">{donorProfile.livesImpacted}</span>
                <p className="text-muted-foreground text-xs mt-1">Calculated: 3 lives per unit</p>
              </div>
            </div>

            <div className="bg-card border border-border rounded-2xl p-5 shadow-xs hover:border-primary/20 transition-all flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Donation Streak</span>
                <Zap className="h-5 w-5 text-amber-500 fill-amber-500/10" />
              </div>
              <div className="mt-4">
                <span className="text-3xl font-bold text-foreground">{donorProfile.currentStreak}🔥</span>
                <p className="text-muted-foreground text-xs mt-1">Consecutive cycles</p>
              </div>
            </div>

            <div className="bg-card border border-border rounded-2xl p-5 shadow-xs hover:border-primary/20 transition-all flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Badges Earned</span>
                <Award className="h-5 w-5 text-indigo-500" />
              </div>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {donorProfile.badges.length === 0 ? (
                  <span className="text-xs text-muted-foreground italic">None yet. Start donating to unlock!</span>
                ) : (
                  donorProfile.badges.map((badge) => (
                    <span
                      key={badge.id}
                      className="inline-flex px-2 py-0.5 rounded-lg bg-secondary/10 text-secondary border border-secondary/20 text-[10px] font-semibold"
                    >
                      {badge.name}
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section: Active Requests, Drives & Community */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Dynamic Emergency Alerts alerts panel */}
          <div className="lg:col-span-2 space-y-6">
            <DonorEmergencyAlerts
              donorId={donorProfile.id}
              isEligible={isEligible}
              initialAlerts={alerts}
            />

            {/* Nearby Donation Drives */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-xs">
              <h3 className="text-lg font-bold text-foreground flex items-center mb-5">
                <Calendar className="h-5 w-5 mr-2 text-primary" />
                Nearby Donation Drives (within 20 km)
              </h3>

              {drivesWithDistance.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground text-xs italic">
                  No upcoming blood drives scheduled nearby.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {drivesWithDistance.map((drive) => (
                    <div
                      key={drive.id}
                      className="p-4 border border-border bg-muted/10 rounded-xl hover:border-primary/20 transition-all"
                    >
                      <span className="inline-flex text-[10px] px-2 py-0.5 bg-secondary/10 border border-secondary/20 text-secondary rounded-lg font-semibold mb-2">
                        {new Date(drive.date).toLocaleDateString()}
                      </span>
                      <h4 className="text-sm font-bold text-foreground truncate">{drive.title}</h4>
                      <p className="text-muted-foreground text-xs mt-1.5 flex items-center">
                        <MapPin className="h-3.5 w-3.5 mr-1 text-muted-foreground shrink-0" />
                        <span>Distance: {drive.distance} km</span>
                      </p>
                      <p className="text-muted-foreground/80 text-[10px] mt-1 flex items-center">
                        <Clock className="h-3.5 w-3.5 mr-1 shrink-0" />
                        <span>{drive.startTime} - {drive.endTime}</span>
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Community Section */}
          <div className="space-y-6">
            {/* Leaderboard Card */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-xs">
              <h3 className="text-base font-bold text-foreground flex items-center mb-4">
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
                  <div key={item.rank} className="flex items-center justify-between py-1.5 border-b border-border/60 last:border-0">
                    <div className="flex items-center space-x-2.5">
                      <span className={`h-5 w-5 rounded-md flex items-center justify-center text-[10px] font-bold ${
                        item.rank === 1
                          ? "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                          : item.rank === 2
                          ? "bg-muted text-muted-foreground border border-border"
                          : "bg-muted text-muted-foreground"
                      }`}>
                        {item.rank}
                      </span>
                      <span className="text-xs font-medium text-foreground">{item.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-semibold text-foreground block">{item.points} pts</span>
                      <span className="text-[10px] text-muted-foreground/80">{item.donations} donations</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Posts / Activity Card */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-xs">
              <h3 className="text-base font-bold text-foreground flex items-center mb-4">
                <Award className="h-4.5 w-4.5 mr-2 text-primary" />
                Community Activity
              </h3>

              <div className="space-y-4">
                <div className="p-3 bg-muted/20 border border-border/80 rounded-xl space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground">St. Mary Blood Center</span>
                    <span className="text-[9px] text-muted-foreground/80">2h ago</span>
                  </div>
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    🎉 Big thanks to everyone who came out to today's drive. We collected 42 units of blood!
                  </p>
                </div>

                <div className="p-3 bg-muted/20 border border-border/80 rounded-xl space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground">Sarah Jenkins</span>
                    <span className="text-[9px] text-muted-foreground/80">1d ago</span>
                  </div>
                  <p className="text-muted-foreground text-xs leading-relaxed">
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
