"use client";

import { useState } from "react";
import { AlertTriangle, Clock, MapPin, Loader2, CheckCircle2 } from "lucide-react";

interface EmergencyAlert {
  id: string;
  bloodRequestId: string;
  hospitalId: string;
  title: string;
  message: string;
  status: string;
  createdAt: string | Date;
  distance: number;
  bloodRequest: {
    id: string;
    bloodGroup: string;
    unitsRequired: number;
    urgency: string;
    createdAt: string | Date;
  };
  hospital: {
    id: string;
    hospitalName: string;
  };
}

interface DonorEmergencyAlertsProps {
  donorId: string;
  isEligible: boolean;
  initialAlerts: EmergencyAlert[];
}

export default function DonorEmergencyAlerts({
  donorId,
  isEligible,
  initialAlerts,
}: DonorEmergencyAlertsProps) {
  const [alerts, setAlerts] = useState<EmergencyAlert[]>(initialAlerts);
  const [loadingAlertId, setLoadingAlertId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleResponse = async (alertId: string, response: "AVAILABLE" | "UNAVAILABLE") => {
    setLoadingAlertId(alertId);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/requests/respond-emergency", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          notificationId: alertId,
          donorId,
          response,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to submit response");
      }

      // Filter out responded alerts
      setAlerts((prev) => prev.filter((a) => a.id !== alertId));

      if (response === "AVAILABLE") {
        setSuccessMsg("Thank you! You have indicated you are available. The blood bank has been notified.");
      } else {
        setSuccessMsg("Response saved. Thank you for letting us know.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to submit response.");
    } finally {
      setLoadingAlertId(null);
    }
  };

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case "LOW":
        return "bg-slate-100 text-slate-700 border-slate-200";
      case "MEDIUM":
        return "bg-blue-50 text-blue-700 border-blue-100";
      case "HIGH":
        return "bg-orange-50 text-orange-700 border-orange-100";
      case "CRITICAL":
        return "bg-red-500/10 text-red-600 border-red-500/20 animate-pulse font-extrabold";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  if (!isEligible) {
    return (
      <div className="bg-card border border-border rounded-2xl p-6 shadow-xs">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-foreground flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2 text-muted-foreground" />
            Urgent Emergency Requests
          </h3>
        </div>
        <div className="text-center py-8 bg-muted/20 border border-border border-dashed rounded-xl">
          <Clock className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
          <h4 className="text-sm font-semibold text-foreground">Emergency Alerts Hidden</h4>
          <p className="text-muted-foreground text-xs max-w-sm mx-auto mt-1 leading-relaxed">
            Emergency requests are only displayed when you are physically eligible to donate.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-xs space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-bold text-foreground flex items-center">
          <AlertTriangle className="h-5 w-5 mr-2 text-secondary animate-pulse" />
          Urgent Emergency Requests ({alerts.length})
        </h3>
        <span className="px-2.5 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-600 text-xs font-bold">
          Live Matches
        </span>
      </div>

      {successMsg && (
        <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center space-x-2 text-green-600 text-xs animate-in fade-in duration-200">
          <CheckCircle2 className="h-4.5 w-4.5 shrink-0" />
          <span className="font-semibold">{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center space-x-2 text-red-600 text-xs animate-in fade-in duration-200">
          <AlertTriangle className="h-4.5 w-4.5 shrink-0" />
          <span className="font-semibold">{errorMsg}</span>
        </div>
      )}

      {alerts.length === 0 ? (
        <div className="text-center py-8 bg-muted/10 border border-border border-dashed rounded-xl text-muted-foreground text-xs italic">
          No urgent emergency broadcasts received. You are all set!
        </div>
      ) : (
        <div className="space-y-4">
          {alerts.map((alert) => {
            const isPending = loadingAlertId === alert.id;

            return (
              <div
                key={alert.id}
                className="p-4 border border-secondary/20 hover:border-secondary/35 bg-secondary/5 rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 transition-all"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-bold text-foreground">
                      {alert.hospital.hospitalName}
                    </span>
                    <span className={`inline-flex text-[9px] px-1.5 py-0.5 rounded border font-semibold ${getUrgencyBadge(alert.bloodRequest.urgency)}`}>
                      {alert.bloodRequest.urgency}
                    </span>
                  </div>
                  <p className="text-muted-foreground text-xs flex items-center">
                    <MapPin className="h-3.5 w-3.5 mr-1 text-muted-foreground shrink-0" />
                    <span>Distance: {alert.distance} km</span>
                  </p>
                  <p className="text-muted-foreground/80 text-[10px] pl-4.5 font-mono">
                    Time: {new Date(alert.bloodRequest.createdAt).toLocaleString()}
                  </p>
                </div>

                <div className="flex items-center space-x-4 self-end sm:self-auto">
                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-muted-foreground block">Needed</span>
                    <span className="text-base font-extrabold text-secondary">
                      {alert.bloodRequest.bloodGroup} ({alert.bloodRequest.unitsRequired} Units)
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleResponse(alert.id, "UNAVAILABLE")}
                      disabled={isPending}
                      className="px-3 py-2 bg-muted hover:bg-muted/80 text-muted-foreground rounded-lg text-xs font-semibold cursor-pointer disabled:opacity-50"
                    >
                      Can't Donate
                    </button>
                    <button
                      onClick={() => handleResponse(alert.id, "AVAILABLE")}
                      disabled={isPending}
                      className="px-3 py-2 bg-secondary hover:bg-secondary/95 text-white rounded-lg text-xs font-semibold flex items-center justify-center space-x-1 cursor-pointer disabled:opacity-50 shadow-xs"
                    >
                      {isPending ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        "I'm Available"
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
