"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Heart,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
  User,
  Building2,
  Landmark,
  Shield,
  Activity,
  Database,
  Calendar
} from "lucide-react";

interface DashboardShellProps {
  children: React.ReactNode;
  userEmail?: string | null;
  userName?: string | null;
  role: "DONOR" | "HOSPITAL" | "BLOOD_BANK";
}

export default function DashboardShell({
  children,
  userEmail,
  userName,
  role,
}: DashboardShellProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Setup navigation items based on role
  const getNavItems = () => {
    switch (role) {
      case "DONOR":
        return [
          { name: "Dashboard", href: "/dashboard/donor", icon: LayoutDashboard },
        ];
      case "HOSPITAL":
        return [
          { name: "Dashboard", href: "/dashboard/hospital", icon: LayoutDashboard },
        ];
      case "BLOOD_BANK":
        return [
          { name: "Dashboard", href: "/dashboard/blood-bank", icon: LayoutDashboard },
          { name: "Blood Inventory", href: "/dashboard/blood-bank/inventory", icon: Database },
          { name: "Record Donation", href: "/dashboard/blood-bank/record", icon: Activity },
          { name: "Blood Drives", href: "/dashboard/blood-bank/drives", icon: Calendar },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  const getRoleBadgeColor = () => {
    switch (role) {
      case "DONOR":
        return "bg-secondary/15 text-secondary border-secondary/20";
      case "HOSPITAL":
        return "bg-primary/15 text-primary border-primary/20";
      case "BLOOD_BANK":
        return "bg-purple-500/10 text-purple-400 border-purple-500/20";
      default:
        return "bg-slate-500/10 text-slate-400 border-slate-500/20";
    }
  };

  const getRoleLabel = () => {
    switch (role) {
      case "DONOR":
        return "Donor";
      case "HOSPITAL":
        return "Hospital";
      case "BLOOD_BANK":
        return "Blood Bank";
      default:
        return "User";
    }
  };

  const getRoleIcon = () => {
    switch (role) {
      case "DONOR":
        return <User className="h-4 w-4" />;
      case "HOSPITAL":
        return <Building2 className="h-4 w-4" />;
      case "BLOOD_BANK":
        return <Landmark className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/auth/signin" });
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-card border-r border-border">
      {/* Branding Header */}
      <div className="h-16 flex items-center px-6 border-b border-border shrink-0">
        <Link href="/" className="flex items-center space-x-2">
          <Heart className="h-7 w-7 text-primary fill-primary animate-pulse" />
          <span className="text-xl font-bold tracking-tight text-foreground font-sans">
            Pulse<span className="text-primary font-bold">Loop</span>
          </span>
        </Link>
      </div>

      {/* User Info Card */}
      <div className="p-5 border-b border-border bg-muted/20">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground font-bold border border-border">
            {userName ? userName[0].toUpperCase() : (userEmail ? userEmail[0].toUpperCase() : "U")}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-semibold text-foreground truncate">
              {userName || "PulseLoop User"}
            </h4>
            <p className="text-xs text-muted-foreground truncate mb-1">
              {userEmail}
            </p>
            <div className={`inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full border text-xs font-semibold ${getRoleBadgeColor()}`}>
              {getRoleIcon()}
              <span>{getRoleLabel()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all ${
                isActive
                  ? "bg-primary/10 text-primary border border-primary/20 shadow-sm shadow-primary/5"
                  : "text-muted-foreground border border-transparent hover:bg-muted hover:text-foreground"
              }`}
            >
              <IconComponent className="mr-3 h-5 w-5 shrink-0" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer Log Out */}
      <div className="p-4 border-t border-border shrink-0">
        <button
          onClick={handleLogout}
          className="w-full flex items-center px-4 py-3 text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 border border-transparent hover:border-destructive/20 rounded-xl transition-all cursor-pointer"
        >
          <LogOut className="mr-3 h-5 w-5 text-muted-foreground group-hover:text-destructive" />
          Log Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row relative">
      {/* Background radial effects */}
      <div className="absolute top-0 right-0 w-[40%] h-[40%] rounded-full bg-primary/5 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-[20%] w-[40%] h-[40%] rounded-full bg-secondary/5 blur-[100px] pointer-events-none" />

      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 shrink-0 h-screen sticky top-0">
        <SidebarContent />
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden flex h-16 items-center justify-between px-6 border-b border-border bg-card shrink-0 z-20">
        <Link href="/" className="flex items-center space-x-2">
          <Heart className="h-6 w-6 text-primary fill-primary animate-pulse" />
          <span className="text-lg font-bold tracking-tight text-foreground font-sans">
            Pulse<span className="text-primary font-bold">Loop</span>
          </span>
        </Link>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground focus:outline-none"
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-30 flex">
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs animate-fade-in"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          {/* Menu Panel */}
          <aside className="relative flex flex-col w-64 max-w-xs h-full bg-card shadow-2xl animate-slide-in">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto max-w-7xl mx-auto w-full z-10">
        {children}
      </main>
    </div>
  );
}
