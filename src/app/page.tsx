import Link from "next/link";
import {
  Heart,
  Activity,
  Users,
  Compass,
  ArrowRight,
  ShieldCheck,
  MapPin,
  Sparkles,
  Layers,
  HeartHandshake
} from "lucide-react";

export default function Home() {
  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen flex flex-col font-sans overflow-x-hidden relative">
      {/* Background blobs for visual appeal */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-teal-900/10 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-rose-900/10 blur-[130px] pointer-events-none" />

      {/* Navigation Bar */}
      <header className="h-20 border-b border-slate-950 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50 flex items-center justify-between px-6 md:px-12 max-w-7xl w-full mx-auto">
        <Link href="/" className="flex items-center space-x-2">
          <Heart className="h-8 w-8 text-rose-500 fill-rose-500 animate-pulse" />
          <span className="text-xl font-bold tracking-tight text-white">
            Pulse<span className="text-teal-400">Loop</span>
          </span>
        </Link>
        <nav className="flex items-center space-x-4">
          <Link
            href="/auth/signin"
            className="px-4 py-2 text-sm font-semibold text-slate-300 hover:text-white transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/auth/signup"
            className="px-4.5 py-2.5 text-sm font-semibold rounded-xl text-white bg-teal-600 hover:bg-teal-500 transition-all shadow-md shadow-teal-900/30"
          >
            Get Started
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="py-20 md:py-32 px-6 md:px-12 max-w-6xl mx-auto text-center space-y-8 z-10">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full border border-teal-500/20 bg-teal-950/30 text-teal-400 text-xs font-semibold">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Streamlining Emergency Blood Supply Chains</span>
        </div>
        
        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white max-w-4xl mx-auto leading-none">
          PulseLoop
        </h1>
        <p className="text-lg sm:text-2xl font-medium text-teal-300">
          Connecting donors, hospitals, and blood banks in one ecosystem.
        </p>
        <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
          PulseLoop integrates real-time inventory management, predictive donor ranking, and automated emergency notifications to ensure blood reaches those who need it most, without delay.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href="/auth/signup"
            className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white rounded-xl font-semibold shadow-lg shadow-teal-900/20 transform hover:-translate-y-0.5 transition-all flex items-center justify-center"
          >
            Get Started <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
          <Link
            href="/auth/signin"
            className="w-full sm:w-auto px-8 py-4 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white rounded-xl font-semibold transition-all flex items-center justify-center"
          >
            Sign In
          </Link>
        </div>
      </section>

      {/* Problem Statement Section */}
      <section className="py-16 bg-slate-900/40 border-y border-slate-900 px-6 md:px-12">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div className="space-y-4">
            <span className="text-xs font-bold text-rose-500 uppercase tracking-widest">The Problem</span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              The Disconnected Lifeline
            </h2>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              Blood shortages often happen because eligible donors are disconnected from urgent needs.
            </p>
            <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
              Hospitals waste precious minutes trying to track down stock or contact donors manually, while willing individuals remain unaware that an emergency donation could save a life nearby.
            </p>
          </div>
          <div className="p-6 bg-slate-950/60 border border-slate-800/80 rounded-2xl relative overflow-hidden flex flex-col justify-center min-h-[200px]">
            <div className="absolute top-2 right-2 flex space-x-1">
              <span className="h-2 w-2 rounded-full bg-rose-500"></span>
              <span className="h-2 w-2 rounded-full bg-slate-700"></span>
            </div>
            <p className="text-teal-400 text-sm font-semibold mb-2">Did you know?</p>
            <p className="text-slate-300 text-sm leading-relaxed">
              "A single blood donation can save up to three lives, yet less than 10% of eligible donors give blood annually due to communication gaps."
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 px-6 md:px-12 max-w-6xl mx-auto space-y-16">
        <div className="text-center space-y-3">
          <span className="text-xs font-bold text-teal-400 uppercase tracking-widest">Workflows</span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">How It Works</h2>
          <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto">
            Our optimized loop coordinates emergency donation requests seamlessly between three key roles.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 bg-slate-900/30 border border-slate-800/60 rounded-2xl relative overflow-hidden group hover:border-slate-700 transition-all">
            <div className="absolute right-0 top-0 w-24 h-24 rounded-full bg-rose-500/5 group-hover:bg-rose-500/10 blur-xl transition-all" />
            <div className="h-12 w-12 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center font-bold text-lg mb-6">
              1
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Donate Blood</h3>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              Donors register their location and blood group. Our automated system calculates eligibility windows and guides them to verified drives nearby.
            </p>
          </div>

          <div className="p-8 bg-slate-900/30 border border-slate-800/60 rounded-2xl relative overflow-hidden group hover:border-slate-700 transition-all">
            <div className="absolute right-0 top-0 w-24 h-24 rounded-full bg-teal-500/5 group-hover:bg-teal-500/10 blur-xl transition-all" />
            <div className="h-12 w-12 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center font-bold text-lg mb-6">
              2
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Track Impact</h3>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              Keep track of donation frequencies, monitor health eligibility, and unlock community badges for consistent donation streaks.
            </p>
          </div>

          <div className="p-8 bg-slate-900/30 border border-slate-800/60 rounded-2xl relative overflow-hidden group hover:border-slate-700 transition-all">
            <div className="absolute right-0 top-0 w-24 h-24 rounded-full bg-emerald-500/5 group-hover:bg-emerald-500/10 blur-xl transition-all" />
            <div className="h-12 w-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-lg mb-6">
              3
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Save Lives</h3>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              When hospitals request blood, blood banks verify and immediately notify nearby, highly-ranked matching donors to fulfill the emergency need.
            </p>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-slate-900/20 border-t border-slate-900/80 px-6 md:px-12">
        <div className="max-w-6xl mx-auto space-y-16">
          <div className="text-center space-y-3">
            <span className="text-xs font-bold text-teal-400 uppercase tracking-widest">Capabilities</span>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">Platform Features</h2>
            <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto">
              Customized interfaces and logic built to maximize speed and donor engagement.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "Donor Dashboard",
                desc: "Personalized panels showing donation eligibility status, streaks, badge progress, and match actions.",
                icon: Users
              },
              {
                title: "Emergency Alerts",
                desc: "Instant matching requests pushed directly to eligible donors when hospitals request stock from blood banks.",
                icon: Activity
              },
              {
                title: "Nearby Drives",
                desc: "Donation drives created by blood banks are dynamically shown only to matching donors within a 5 km radius.",
                icon: MapPin
              },
              {
                title: "Hospital Requests",
                desc: "Hospitals can instantly create and log emergency blood requests, monitoring real-time verification and fulfillment.",
                icon: HeartHandshake
              },
              {
                title: "Blood Bank Inventory",
                desc: "Centralized stocks categorized by group type to help banks quickly determine if incoming requests can be met immediately.",
                icon: Layers
              },
              {
                title: "Donor Ranking System",
                desc: "Algorithms ranking donors based on distance, group match, donation history, and response rates.",
                icon: ShieldCheck
              }
            ].map((feat) => {
              const Icon = feat.icon;
              return (
                <div key={feat.title} className="p-6 bg-slate-900/40 border border-slate-800/80 rounded-xl space-y-4 hover:border-slate-700 transition-all flex flex-col justify-start">
                  <div className="h-10 w-10 rounded-lg bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h4 className="text-base font-bold text-white">{feat.title}</h4>
                  <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">{feat.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section className="py-24 px-6 md:px-12 max-w-5xl mx-auto text-center space-y-16">
        <div className="text-center space-y-3">
          <span className="text-xs font-bold text-rose-500 uppercase tracking-widest font-mono">Live Stats</span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">Our Growing Impact</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          <div className="p-6 bg-slate-900/30 border border-slate-800 rounded-2xl">
            <span className="text-4xl sm:text-5xl font-black text-white block">1,200+</span>
            <span className="text-slate-400 text-xs sm:text-sm mt-2 block font-semibold">Registered Donors</span>
          </div>

          <div className="p-6 bg-slate-900/30 border border-slate-800 rounded-2xl">
            <span className="text-4xl sm:text-5xl font-black text-rose-500 block">250+</span>
            <span className="text-slate-400 text-xs sm:text-sm mt-2 block font-semibold">Lives Impacted</span>
          </div>

          <div className="p-6 bg-slate-900/30 border border-slate-800 rounded-2xl">
            <span className="text-4xl sm:text-5xl font-black text-teal-400 block">40+</span>
            <span className="text-slate-400 text-xs sm:text-sm mt-2 block font-semibold">Blood Drives</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-900 py-12 px-6 md:px-12 text-center text-slate-500 text-xs">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-1.5">
            <Heart className="h-4 w-4 text-rose-500 fill-rose-500" />
            <span className="font-semibold text-slate-400">PulseLoop © 2026</span>
          </div>
          <p>Connecting emergency blood loops to save lives.</p>
        </div>
      </footer>
    </div>
  );
}
