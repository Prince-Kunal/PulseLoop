"use client";

import { useState } from "react";
import {
  User,
  Phone,
  MapPin,
  Lock,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Building
} from "lucide-react";

interface ProfileData {
  id: string;
  fullName?: string;
  hospitalName?: string;
  bloodBankName?: string;
  phone?: string;
  city: string | null;
  state: string | null;
  createdAt: string | Date;
}

interface ProfileSettingsProps {
  userRole: string;
  userEmail: string;
  profile: ProfileData;
}

export default function ProfileSettings({
  userRole,
  userEmail,
  profile,
}: ProfileSettingsProps) {
  const [formData, setFormData] = useState({
    fullName: profile.fullName || profile.hospitalName || profile.bloodBankName || "",
    phone: profile.phone || "",
    city: profile.city || "",
    state: profile.state || "",
    password: "",
    confirmPassword: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const getNameLabel = () => {
    if (userRole === "DONOR") return "Donor Full Name";
    if (userRole === "HOSPITAL") return "Hospital Name";
    if (userRole === "BLOOD_BANK") return "Blood Bank Name";
    return "Full Name";
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(null);
    setErrorMsg(null);

    if (formData.password && formData.password !== formData.confirmPassword) {
      setErrorMsg("New passwords do not match.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: formData.fullName,
          phone: formData.phone,
          city: formData.city,
          state: formData.state,
          password: formData.password || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update profile settings");
      }

      setSuccessMsg("Profile settings successfully updated!");
      setFormData((prev) => ({ ...prev, password: "", confirmPassword: "" }));
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to update settings.");
    } finally {
      setIsLoading(false);
    }
  };

  // Mock account activity log matching role
  const getAccountActivity = () => {
    const defaultLogs = [
      { id: "act-1", event: "Authenticated session started", date: "Today" },
      { id: "act-2", event: "Profile settings synchronized", date: "Yesterday" },
      { id: "act-3", event: "Account initialized on PulseLoop", date: new Date(profile.createdAt).toLocaleDateString() },
    ];
    return defaultLogs;
  };

  const logs = getAccountActivity();

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <span className="text-xs font-semibold uppercase tracking-wider text-primary">Identity & Account</span>
        <h2 className="text-2xl font-bold text-foreground mt-1">Profile Settings</h2>
        <p className="text-muted-foreground text-xs mt-1">
          Manage your personal details, geographical filters, account credentials, and system logs.
        </p>
      </div>

      {/* Grid wrapper */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Settings form card */}
        <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-6 shadow-md space-y-6">
          <div className="flex items-center space-x-2 pb-3 border-b border-border">
            <User className="h-5 w-5 text-primary" />
            <h3 className="text-sm font-bold text-foreground">Edit Account Information</h3>
          </div>

          {successMsg && (
            <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center space-x-2 text-green-600 text-xs">
              <CheckCircle2 className="h-4.5 w-4.5 shrink-0" />
              <span className="font-semibold">{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center space-x-2 text-red-600 text-xs">
              <AlertTriangle className="h-4.5 w-4.5 shrink-0" />
              <span className="font-semibold">{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleUpdate} className="space-y-5">
            {/* Split row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-muted-foreground">{getNameLabel()}</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4.5 w-4.5 text-muted-foreground/60" />
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData((prev) => ({ ...prev, fullName: e.target.value }))}
                    className="w-full bg-muted border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-xl pl-10 pr-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
                  />
                </div>
              </div>

              {userRole === "DONOR" && (
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-muted-foreground font-semibold">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4.5 w-4.5 text-muted-foreground/60" />
                    <input
                      type="text"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                      className="w-full bg-muted border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-xl pl-10 pr-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Location settings row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-muted-foreground">City</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4.5 w-4.5 text-muted-foreground/60" />
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData((prev) => ({ ...prev, city: e.target.value }))}
                    placeholder="e.g. New York"
                    className="w-full bg-muted border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-xl pl-10 pr-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-muted-foreground">State</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4.5 w-4.5 text-muted-foreground/60" />
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData((prev) => ({ ...prev, state: e.target.value }))}
                    placeholder="e.g. NY"
                    className="w-full bg-muted border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-xl pl-10 pr-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Email (Read Only) */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-muted-foreground">Account Email (Cannot Change)</label>
              <input
                type="email"
                disabled
                value={userEmail}
                className="w-full bg-muted/65 border border-border rounded-xl px-3 py-2.5 text-xs text-muted-foreground cursor-not-allowed"
              />
            </div>

            {/* Password edit fields */}
            <div className="pt-4 border-t border-border/60 space-y-4">
              <div className="flex items-center space-x-2 text-foreground/80 font-bold text-xs">
                <Lock className="h-4 w-4 text-primary" />
                <span>Change Password (Leave blank to keep current)</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-muted-foreground">New Password</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                    placeholder="Min 6 characters"
                    className="w-full bg-muted border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-muted-foreground">Confirm New Password</label>
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                    placeholder="Verify password"
                    className="w-full bg-muted border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-3">
              <button
                type="submit"
                disabled={isLoading}
                className="px-5 py-2.5 bg-primary hover:bg-primary/95 text-primary-foreground font-semibold rounded-xl text-xs flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50 transition-all shadow-xs"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Activity & Side panel */}
        <div className="space-y-6">
          {/* Mock profile picture edit portal */}
          <div className="bg-card border border-border rounded-2xl p-5 shadow-md text-center space-y-4">
            <div className="h-20 w-20 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center mx-auto text-2xl font-bold">
              {formData.fullName.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Profile Image</h4>
              <p className="text-[11px] text-muted-foreground mt-1">Upload a professional clinic logo or photo.</p>
            </div>
            <button className="px-3 py-1.5 bg-muted hover:bg-muted/80 text-foreground font-semibold rounded-xl text-[10px] transition-colors cursor-pointer">
              Upload New Photo
            </button>
          </div>

          {/* Account Activity Logs */}
          <div className="bg-card border border-border rounded-2xl p-5 shadow-md space-y-4">
            <div className="flex items-center space-x-2 text-muted-foreground pb-2 border-b border-border/60">
              <Clock className="h-4 w-4 shrink-0" />
              <h4 className="text-xs font-bold text-foreground">Account Activity Logs</h4>
            </div>

            <div className="space-y-3">
              {logs.map((log) => (
                <div key={log.id} className="flex justify-between items-center text-[10px] text-muted-foreground">
                  <span className="truncate pr-2">{log.event}</span>
                  <span className="shrink-0 text-muted-foreground/60">{log.date}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
