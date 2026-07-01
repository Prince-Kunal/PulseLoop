"use client";

import { useState } from "react";
import {
  Building2,
  Droplet,
  Clock,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  ListOrdered,
  XCircle,
  Send,
  ChevronDown,
  ChevronUp
} from "lucide-react";

interface BloodRequest {
  id: string;
  bloodGroup: string;
  unitsRequired: number;
  urgency: string;
  notes: string | null;
  patientAge: number | null;
  status: string;
  bloodBankId?: string | null;
  createdAt: string | Date;
  hospital: {
    hospitalName: string;
    latitude: number;
    longitude: number;
  };
}

interface ScoredDonor {
  id: string;
  fullName: string;
  distance: number;
  lastDonationDate: string | null;
  totalDonations: number;
  score: number;
  breakdown: {
    eligibility: number;
    distance: number;
    responseRate: number;
    donationHistory: number;
    activityBonus: number;
  };
}

interface HospitalRequestsConsoleProps {
  bloodBankId: string;
  initialRequests: BloodRequest[];
}

export default function HospitalRequestsConsole({
  bloodBankId,
  initialRequests,
}: HospitalRequestsConsoleProps) {
  const [requests, setRequests] = useState<BloodRequest[]>(initialRequests);
  const [loadingRequestId, setLoadingRequestId] = useState<string | null>(null);
  
  // Feedback states
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  
  // Prioritization lists state
  const [activePriorityRequest, setActivePriorityRequest] = useState<string | null>(null);
  const [rankedDonors, setRankedDonors] = useState<ScoredDonor[]>([]);
  const [isPriorityLoading, setIsPriorityLoading] = useState(false);
  const [selectedDonorIds, setSelectedDonorIds] = useState<string[]>([]);
  const [expandedDonorId, setExpandedDonorId] = useState<string | null>(null);
  const [notificationsSentMessage, setNotificationsSentMessage] = useState<string | null>(null);

  const handleResponse = async (requestId: string, action: "ACCEPT" | "REJECT") => {
    setLoadingRequestId(requestId);
    setActionError(null);
    setSuccessMessage(null);
    setActivePriorityRequest(null);
    setRankedDonors([]);
    setNotificationsSentMessage(null);

    try {
      const res = await fetch("/api/requests/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId,
          bloodBankId,
          action,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.error === "INSUFFICIENT_STOCK") {
          setActivePriorityRequest(requestId);
          // Automatically fetch priority list when stock check fails
          fetchPriorityList(requestId);
          throw new Error("Insufficient stock in inventory.");
        }
        throw new Error(data.error || "Failed to respond to request");
      }

      // Update state local list on success
      setRequests((prev) =>
        prev.map((r) =>
          r.id === requestId
            ? { ...r, status: action === "ACCEPT" ? "ACCEPTED" : "REJECTED", bloodBankId }
            : r
        )
      );

      if (action === "ACCEPT") {
        setSuccessMessage("Blood request accepted successfully! Inventory units have been deducted.");
      } else {
        setSuccessMessage("Request successfully rejected.");
      }
    } catch (err: any) {
      setActionError(err.message || "Failed to submit response.");
    } finally {
      setLoadingRequestId(null);
    }
  };

  const fetchPriorityList = async (requestId: string) => {
    setIsPriorityLoading(true);
    setRankedDonors([]);
    setSelectedDonorIds([]);
    setNotificationsSentMessage(null);

    try {
      const res = await fetch(`/api/requests/priority-list?requestId=${requestId}&bloodBankId=${bloodBankId}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch priority list");
      }

      setRankedDonors(data.donors);
      // Auto select top 5 by default if available
      if (data.donors.length > 0) {
        setSelectedDonorIds(data.donors.slice(0, 5).map((d: ScoredDonor) => d.id));
      }
    } catch (err: any) {
      setActionError(err.message || "Failed to compile priority ranking.");
    } finally {
      setIsPriorityLoading(false);
    }
  };

  const handleSelectShortcut = (count: number) => {
    setSelectedDonorIds(rankedDonors.slice(0, count).map((d) => d.id));
  };

  const handleToggleSelectDonor = (donorId: string) => {
    setSelectedDonorIds((prev) =>
      prev.includes(donorId) ? prev.filter((id) => id !== donorId) : [...prev, donorId]
    );
  };

  const handleSendNotifications = async (requestId: string) => {
    if (selectedDonorIds.length === 0) {
      setActionError("Please select at least one donor to notify.");
      return;
    }

    setIsPriorityLoading(true);
    setActionError(null);
    setNotificationsSentMessage(null);

    try {
      const res = await fetch("/api/requests/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId,
          donorIds: selectedDonorIds,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to send notifications");
      }

      setNotificationsSentMessage(`Notifications successfully sent to the ${selectedDonorIds.length} selected donors!`);
      // Reset prioritization panel
      setActivePriorityRequest(null);
      setRankedDonors([]);
    } catch (err: any) {
      setActionError(err.message || "Failed to broadcast notifications.");
    } finally {
      setIsPriorityLoading(false);
    }
  };

  // Split pending vs assigned requests
  const pendingRequests = requests.filter((r) => r.status === "PENDING");
  const myAssignedRequests = requests.filter(
    (r) => r.status !== "PENDING" && r.bloodBankId === bloodBankId
  );

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

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-amber-500/10 border-amber-500/20 text-amber-600";
      case "ACCEPTED":
        return "bg-blue-500/10 border-blue-500/20 text-blue-600";
      case "IN_PROGRESS":
        return "bg-purple-500/10 border-purple-500/20 text-purple-600";
      case "FULFILLED":
        return "bg-green-500/10 border-green-500/20 text-green-600";
      case "REJECTED":
        return "bg-red-500/10 border-red-500/20 text-red-600";
      default:
        return "bg-muted border-border text-muted-foreground";
    }
  };

  return (
    <div className="space-y-8">
      {/* Global Toast Alerts */}
      {successMessage && (
        <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center space-x-3 text-green-600 text-xs animate-in fade-in duration-200">
          <CheckCircle2 className="h-4.5 w-4.5 shrink-0" />
          <span className="font-semibold">{successMessage}</span>
        </div>
      )}

      {notificationsSentMessage && (
        <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl flex items-center space-x-3 text-purple-700 text-xs animate-in fade-in duration-200">
          <CheckCircle2 className="h-4.5 w-4.5 shrink-0" />
          <span className="font-semibold">{notificationsSentMessage}</span>
        </div>
      )}

      {actionError && !activePriorityRequest && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center space-x-3 text-red-600 text-xs animate-in fade-in duration-200">
          <AlertTriangle className="h-4.5 w-4.5 shrink-0" />
          <span className="font-semibold">{actionError}</span>
        </div>
      )}

      {/* Prioritization Panel Overlay */}
      {activePriorityRequest && (
        <div className="p-6 bg-amber-500/5 border border-amber-500/10 rounded-2xl space-y-6 shadow-xs animate-in slide-in-from-top-2 duration-300">
          <div className="flex items-start space-x-3 text-amber-800">
            <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-sm">Inventory Insufficient to Fulfill Request</h4>
              <p className="text-xs text-amber-700/90 mt-1 leading-relaxed">
                Your database stock level is lower than the requested units. Log prioritized eligible donors to activate emergency notification broadcasts.
              </p>
            </div>
          </div>

          {isPriorityLoading ? (
            <div className="flex items-center justify-center py-10 space-x-2 text-xs text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <span>Compiling and scoring eligible donors...</span>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Shortcut buttons */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t border-border/60">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-muted-foreground font-semibold">Select Shortcuts:</span>
                  <button
                    onClick={() => handleSelectShortcut(5)}
                    className="px-2.5 py-1 bg-muted hover:bg-muted/80 text-muted-foreground rounded-lg text-[10px] font-bold cursor-pointer"
                  >
                    Top 5 Donors
                  </button>
                  <button
                    onClick={() => handleSelectShortcut(10)}
                    className="px-2.5 py-1 bg-muted hover:bg-muted/80 text-muted-foreground rounded-lg text-[10px] font-bold cursor-pointer"
                  >
                    Top 10 Donors
                  </button>
                  <button
                    onClick={() => handleSelectShortcut(20)}
                    className="px-2.5 py-1 bg-muted hover:bg-muted/80 text-muted-foreground rounded-lg text-[10px] font-bold cursor-pointer"
                  >
                    Top 20 Donors
                  </button>
                </div>

                <button
                  onClick={() => handleSendNotifications(activePriorityRequest)}
                  disabled={selectedDonorIds.length === 0}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl text-xs flex items-center space-x-1.5 transition-all cursor-pointer shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Notify {selectedDonorIds.length} Selected Donors</span>
                </button>
              </div>

              {/* Ranked donor list */}
              {rankedDonors.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground text-xs italic">
                  No eligible matching donors found for this blood group.
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                  {rankedDonors.map((donor) => {
                    const isSelected = selectedDonorIds.includes(donor.id);
                    const isExpanded = expandedDonorId === donor.id;

                    return (
                      <div
                        key={donor.id}
                        className={`border rounded-xl p-4 transition-all ${
                          isSelected ? "bg-purple-500/5 border-purple-500/20" : "bg-card border-border hover:border-primary/20"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleSelectDonor(donor.id)}
                              className="h-4.5 w-4.5 rounded border-border text-purple-600 focus:ring-purple-500 cursor-pointer"
                            />
                            <div>
                              <span className="text-xs font-bold text-foreground block">{donor.fullName}</span>
                              <span className="text-[10px] text-muted-foreground mt-0.5 block">
                                Distance: {donor.distance} km | Donations: {donor.totalDonations}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center space-x-3">
                            <div className="text-right">
                              <span className="text-sm font-black text-purple-600 block">{donor.score}</span>
                              <span className="text-[9px] uppercase font-bold text-muted-foreground">score</span>
                            </div>
                            <button
                              onClick={() => setExpandedDonorId(isExpanded ? null : donor.id)}
                              className="p-1 rounded hover:bg-muted text-muted-foreground cursor-pointer"
                            >
                              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>

                        {/* Expandable breakdown scores */}
                        {isExpanded && (
                          <div className="mt-3 pt-3 border-t border-border/50 text-[10px] text-muted-foreground space-y-2 animate-in fade-in duration-200">
                            <span className="font-bold text-foreground block mb-1">Scoring Breakdown</span>
                            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                              <div className="bg-muted/40 p-2 rounded-lg border border-border/40 text-center">
                                <span className="block text-[8px] font-bold uppercase text-muted-foreground">Eligibility</span>
                                <span className="text-xs font-bold text-foreground mt-0.5 block">+{donor.breakdown.eligibility}</span>
                              </div>
                              <div className="bg-muted/40 p-2 rounded-lg border border-border/40 text-center">
                                <span className="block text-[8px] font-bold uppercase text-muted-foreground">Distance</span>
                                <span className="text-xs font-bold text-foreground mt-0.5 block">+{donor.breakdown.distance}</span>
                              </div>
                              <div className="bg-muted/40 p-2 rounded-lg border border-border/40 text-center">
                                <span className="block text-[8px] font-bold uppercase text-muted-foreground">Response Rate</span>
                                <span className="text-xs font-bold text-foreground mt-0.5 block">+{donor.breakdown.responseRate}</span>
                              </div>
                              <div className="bg-muted/40 p-2 rounded-lg border border-border/40 text-center">
                                <span className="block text-[8px] font-bold uppercase text-muted-foreground">Donations</span>
                                <span className="text-xs font-bold text-foreground mt-0.5 block">+{donor.breakdown.donationHistory}</span>
                              </div>
                              <div className="bg-muted/40 p-2 rounded-lg border border-border/40 text-center">
                                <span className="block text-[8px] font-bold uppercase text-muted-foreground">Activity</span>
                                <span className="text-xs font-bold text-foreground mt-0.5 block">+{donor.breakdown.activityBonus}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Broadcasted Hospital Requests section */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-foreground flex items-center">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-600 mr-2" />
          Broadcasted Hospital Requests ({pendingRequests.length})
        </h3>

        {pendingRequests.length === 0 ? (
          <div className="p-10 border border-dashed border-border rounded-2xl text-center text-muted-foreground text-sm">
            No pending hospital requests available.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pendingRequests.map((req) => {
              const isPending = loadingRequestId === req.id;

              return (
                <div
                  key={req.id}
                  className="bg-card border border-border rounded-2xl p-5 shadow-sm hover:border-primary/20 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3.5">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center space-x-2">
                        <div className="h-8 w-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-600">
                          <Droplet className="h-4 w-4 fill-red-600" />
                        </div>
                        <div>
                          <span className="font-extrabold text-foreground text-sm">{req.bloodGroup} Required</span>
                          <span className="text-[9px] text-muted-foreground block mt-0.5 font-mono">
                            #RQ-{req.id.slice(-6).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded border font-semibold ${getUrgencyBadge(req.urgency)}`}>
                        {req.urgency}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center space-x-1 text-xs font-bold text-foreground">
                        <Building2 className="h-3.5 w-3.5 text-primary shrink-0" />
                        <span>{req.hospital.hospitalName}</span>
                      </div>
                      <p className="text-muted-foreground text-xs leading-relaxed line-clamp-2 pl-4.5">
                        {req.notes || "No clinical notes provided."}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-[11px] text-muted-foreground pt-2 border-t border-border/60 pl-4.5">
                      <div className="flex items-center space-x-1.5">
                        <Clock className="h-3.5 w-3.5 text-primary shrink-0" />
                        <span>Units Needed: {req.unitsRequired}</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <Calendar className="h-3.5 w-3.5 text-primary shrink-0" />
                        <span>Raised: {new Date(req.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 pt-4 mt-4 border-t border-border/60">
                    <button
                      onClick={() => handleResponse(req.id, "REJECT")}
                      disabled={isPending}
                      className="flex-1 py-2 bg-muted hover:bg-muted/80 text-muted-foreground border border-border rounded-xl font-semibold text-xs cursor-pointer transition-colors disabled:opacity-50"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleResponse(req.id, "ACCEPT")}
                      disabled={isPending}
                      className="flex-1 py-2 bg-primary hover:bg-primary/95 text-primary-foreground rounded-xl font-semibold text-xs flex items-center justify-center space-x-1 cursor-pointer transition-all disabled:opacity-50 shadow-xs"
                    >
                      {isPending ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        "Accept Request"
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* My Accepted Requests section */}
      <div className="space-y-4 pt-4 border-t border-border">
        <h3 className="text-base font-bold text-foreground flex items-center">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-green-500 mr-2" />
          My Accepted & Active Requests ({myAssignedRequests.length})
        </h3>

        {myAssignedRequests.length === 0 ? (
          <div className="text-muted-foreground text-xs italic pl-4">No active requests currently accepted by you.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {myAssignedRequests.map((req) => (
              <div
                key={req.id}
                className="bg-card border border-border rounded-2xl p-5 shadow-xs flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-2">
                      <div className="h-8 w-8 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-600">
                        <CheckCircle2 className="h-4 w-4" />
                      </div>
                      <div>
                        <span className="font-extrabold text-foreground text-sm">{req.bloodGroup} Allocated</span>
                        <span className="text-[9px] text-muted-foreground block mt-0.5 font-mono">
                          #RQ-{req.id.slice(-6).toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded border font-bold ${getStatusStyle(req.status)}`}>
                      {req.status}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center space-x-1 text-xs font-bold text-foreground">
                      <Building2 className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span>{req.hospital.hospitalName}</span>
                    </div>
                    <p className="text-muted-foreground text-xs leading-relaxed line-clamp-1 pl-4.5">
                      {req.notes || "No clinical reasons or notes provided."}
                    </p>
                  </div>

                  <div className="flex items-between justify-between text-[11px] text-muted-foreground pt-2 border-t border-border/60 pl-4.5">
                    <span>Units Allocated: {req.unitsRequired}</span>
                    <span>Accepted: {new Date(req.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
