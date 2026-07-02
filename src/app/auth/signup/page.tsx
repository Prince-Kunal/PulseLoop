"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MapPin, Loader2, CheckCircle2, User, Building2, Landmark } from "lucide-react";
import Logo from "@/components/Logo";

export default function SignupPage() {
  const router = useRouter();
  const [role, setRole] = useState<"DONOR" | "HOSPITAL" | "BLOOD_BANK">("DONOR");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Common Form Fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Donor-specific fields
  const [fullName, setFullName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [phone, setPhone] = useState("");
  const [bloodGroup, setBloodGroup] = useState("A+");

  // Hospital-specific fields
  const [hospitalName, setHospitalName] = useState("");

  // Blood Bank-specific fields
  const [bloodBankName, setBloodBankName] = useState("");

  // Location fields
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [locating, setLocating] = useState(false);
  const [locationSuccess, setLocationSuccess] = useState(false);

  // Fetch coordinates using Web Geolocation API
  const detectLocation = () => {
    setLocating(true);
    setError("");
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      setLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude.toFixed(6));
        setLongitude(position.coords.longitude.toFixed(6));
        setLocationSuccess(true);
        setLocating(false);
      },
      (err) => {
        console.error("Geolocation error:", err);
        setError("Unable to retrieve your location. Please input coordinates manually.");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!latitude || !longitude) {
      setError("Location coordinates are required. Please detect or type your coordinates.");
      setLoading(false);
      return;
    }

    const payload: any = {
      email,
      password,
      role,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
    };

    if (role === "DONOR") {
      payload.fullName = fullName;
      payload.dateOfBirth = dateOfBirth;
      payload.phone = phone;
      payload.bloodGroup = bloodGroup;
    } else if (role === "HOSPITAL") {
      payload.hospitalName = hospitalName;
    } else if (role === "BLOOD_BANK") {
      payload.bloodBankName = bloodBankName;
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to register. Please try again.");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/auth/signin");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-secondary/10 blur-[120px] pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10">
        <Link href="/" className="flex items-center justify-center space-x-2">
          <Logo size="md" className="h-9 w-9" />
          <span className="text-2xl font-bold tracking-tight text-foreground font-sans">
            Pulse<span className="text-primary font-bold">Loop</span>
          </span>
        </Link>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-foreground tracking-tight">
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Or{" "}
          <Link href="/auth/signin" className="font-medium text-primary hover:text-primary/95 transition-colors">
            sign in to your existing account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl z-10">
        <div className="bg-card border border-border py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10">
          {success ? (
            <div className="text-center py-12 flex flex-col items-center justify-center">
              <CheckCircle2 className="h-16 w-16 text-primary mb-4 animate-bounce" />
              <h3 className="text-2xl font-bold text-foreground mb-2">Registration Successful!</h3>
              <p className="text-muted-foreground">Redirecting you to the sign in page...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Role Selection Tabs */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-3">
                  I want to register as a:
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => { setRole("DONOR"); setError(""); }}
                    className={`flex flex-col items-center justify-center py-3.5 px-3 border rounded-xl text-xs font-medium transition-all ${
                      role === "DONOR"
                        ? "border-primary bg-primary/10 text-primary shadow-sm"
                        : "border-border bg-card text-muted-foreground hover:bg-slate-50 hover:text-foreground"
                    }`}
                  >
                    <User className="h-5 w-5 mb-1.5" />
                    Donor
                  </button>
                  <button
                    type="button"
                    onClick={() => { setRole("HOSPITAL"); setError(""); }}
                    className={`flex flex-col items-center justify-center py-3.5 px-3 border rounded-xl text-xs font-medium transition-all ${
                      role === "HOSPITAL"
                        ? "border-primary bg-primary/10 text-primary shadow-sm"
                        : "border-border bg-card text-muted-foreground hover:bg-slate-50 hover:text-foreground"
                    }`}
                  >
                    <Building2 className="h-5 w-5 mb-1.5" />
                    Hospital
                  </button>
                  <button
                    type="button"
                    onClick={() => { setRole("BLOOD_BANK"); setError(""); }}
                    className={`flex flex-col items-center justify-center py-3.5 px-3 border rounded-xl text-xs font-medium transition-all ${
                      role === "BLOOD_BANK"
                        ? "border-primary bg-primary/10 text-primary shadow-sm"
                        : "border-border bg-card text-muted-foreground hover:bg-slate-50 hover:text-foreground"
                    }`}
                  >
                    <Landmark className="h-5 w-5 mb-1.5" />
                    Blood Bank
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-rose-50 border border-rose-200 text-rose-600 px-4 py-3 rounded-xl text-sm" role="alert">
                  {error}
                </div>
              )}

              {/* Dynamic Profiles fields */}
              <div className="space-y-4">
                {role === "DONOR" && (
                  <>
                    <div>
                      <label htmlFor="fullName" className="block text-sm font-medium text-foreground">
                        Full Name
                      </label>
                      <input
                        id="fullName"
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="John Doe"
                        className="mt-1 block w-full px-4 py-3 bg-muted/50 border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="dateOfBirth" className="block text-sm font-medium text-foreground">
                          Date of Birth
                        </label>
                        <input
                          id="dateOfBirth"
                          type="date"
                          required
                          value={dateOfBirth}
                          onChange={(e) => setDateOfBirth(e.target.value)}
                          className="mt-1 block w-full px-4 py-3 bg-muted/50 border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm"
                        />
                      </div>
                      <div>
                        <label htmlFor="bloodGroup" className="block text-sm font-medium text-foreground">
                          Blood Group
                        </label>
                        <select
                          id="bloodGroup"
                          value={bloodGroup}
                          onChange={(e) => setBloodGroup(e.target.value)}
                          className="mt-1 block w-full px-4 py-3 bg-muted/50 border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm"
                        >
                          {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bg) => (
                            <option key={bg} value={bg} className="bg-card text-foreground">
                              {bg}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-foreground">
                        Phone Number
                      </label>
                      <input
                        id="phone"
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+1 (555) 000-0000"
                        className="mt-1 block w-full px-4 py-3 bg-muted/50 border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm"
                      />
                    </div>
                  </>
                )}

                {role === "HOSPITAL" && (
                  <div>
                    <label htmlFor="hospitalName" className="block text-sm font-medium text-foreground">
                      Hospital Name
                    </label>
                    <input
                      id="hospitalName"
                      type="text"
                      required
                      value={hospitalName}
                      onChange={(e) => setHospitalName(e.target.value)}
                      placeholder="City General Hospital"
                      className="mt-1 block w-full px-4 py-3 bg-muted/50 border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm"
                    />
                  </div>
                )}

                {role === "BLOOD_BANK" && (
                  <div>
                    <label htmlFor="bloodBankName" className="block text-sm font-medium text-foreground">
                      Blood Bank Name
                    </label>
                    <input
                      id="bloodBankName"
                      type="text"
                      required
                      value={bloodBankName}
                      onChange={(e) => setBloodBankName(e.target.value)}
                      placeholder="Red Cross Blood Center"
                      className="mt-1 block w-full px-4 py-3 bg-muted/50 border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm"
                    />
                  </div>
                )}

                {/* Common Account Credentials */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-foreground">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="mt-1 block w-full px-4 py-3 bg-muted/50 border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-foreground">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="mt-1 block w-full px-4 py-3 bg-muted/50 border border-border rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm"
                  />
                </div>

                {/* Location Detection */}
                <div className="bg-muted/30 border border-border rounded-xl p-4 mt-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-foreground flex items-center">
                        <MapPin className="h-4 w-4 mr-1.5 text-primary" />
                        Location Coordinates
                      </h4>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        PulseLoop uses coordinates to match emergency needs.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={detectLocation}
                      disabled={locating}
                      className="px-3 py-1.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-xs font-semibold flex items-center justify-center transition-colors disabled:opacity-50"
                    >
                      {locating ? (
                        <>
                          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                          Locating...
                        </>
                      ) : (
                        "Detect Location"
                      )}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <div>
                      <label htmlFor="latitude" className="block text-xs font-medium text-muted-foreground mb-1">
                        Latitude
                      </label>
                      <input
                        id="latitude"
                        type="number"
                        step="any"
                        required
                        value={latitude}
                        onChange={(e) => {
                          setLatitude(e.target.value);
                          setLocationSuccess(false);
                        }}
                        placeholder="e.g. 40.7128"
                        className="block w-full px-3 py-2 bg-card border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition-all text-xs"
                      />
                    </div>
                    <div>
                      <label htmlFor="longitude" className="block text-xs font-medium text-muted-foreground mb-1">
                        Longitude
                      </label>
                      <input
                        id="longitude"
                        type="number"
                        step="any"
                        required
                        value={longitude}
                        onChange={(e) => {
                          setLongitude(e.target.value);
                          setLocationSuccess(false);
                        }}
                        placeholder="e.g. -74.0060"
                        className="block w-full px-3 py-2 bg-card border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition-all text-xs"
                      />
                    </div>
                  </div>

                  {locationSuccess && (
                    <div className="flex items-center text-primary text-xs mt-2.5">
                      <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                      Coordinates successfully acquired via geolocation.
                    </div>
                  )}
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg text-sm font-semibold text-white bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-primary transition-all transform hover:-translate-y-0.5 cursor-pointer disabled:opacity-50 disabled:transform-none"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    "Register Now"
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
