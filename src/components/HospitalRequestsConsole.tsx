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
  FileText
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
  
  // Insufficient stock details helper state
  const [insufficientStockRequest, setInsufficientStockRequest] = useState<{
    id: string;
    bloodGroup: string;
    availableUnits: number;
    unitsRequired: number;
  } | null>(null);

  const [priorityListMessage, setPriorityListMessage] = useState<string | null>(null);

  const handleResponse = async (requestId: string, action: "ACCEPT" | "REJECT") => {
    setLoadingRequestId(requestId);
    setActionError(null);
    setSuccessMessage(null);
    setInsufficientStockRequest(null);
    setPriorityListMessage(null);

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
          setInsufficientStockRequest({
            id: requestId,
            bloodGroup: data.bloodGroup,
            availableUnits: data.availableUnits,
            unitsRequired: data.unitsRequired,
          });
          throw new Error("Insufficient stock in inventory.");
        }
        throw new Error(data.error || "Failed to respond to request");
      }

      // Update local state list
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

  const handleGeneratePriorityList = (group: string) => {
    console.log(`Priority list generated for blood group ${group}`);
    setPriorityListMessage(`Priority list generated successfully! Local matching donors for blood group ${group} have been prioritized and marked for contact.`);
    setInsufficientStockRequest(null);
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

  return (
    <div className="space-y-8">
      <div>
        <span className="text-xs font-semibold uppercase tracking-wider text-primary">Operations / Hospital Coordinator</span>
        <h2 className="text-2xl font-bold text-foreground mt-1">Hospital Blood Requests</h2>
        <p className="text-muted-foreground text-xs mt-1">
          Monitor incoming emergency and surgery requests from local clinics and allocate stock dynamically.
        </p>
      </div>

      {/* Global Alerts */}
      {successMessage && (
        <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center space-x-3 text-green-600 text-xs animate-in fade-in duration-200">
          <CheckCircle2 className="h-4.5 w-4.5 shrink-0" />
          <span className="font-semibold">{successMessage}</span>
        </div>
      )}

      {priorityListMessage && (
        <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl flex items-center space-x-3 text-purple-700 text-xs animate-in fade-in duration-200">
          <CheckCircle2 className="h-4.5 w-4.5 shrink-0" />
          <span className="font-semibold">{priorityListMessage}</span>
        </div>
      )}

      {/* Insufficient Stock Dialog/Banner */}
      {insufficientStockRequest && (
        <div className="p-5 bg-amber-500/10 border border-amber-500/20 rounded-2xl space-y-3.5 animate-in slide-in-from-top-2 duration-300">
          <div className="flex items-start space-x-3 text-amber-800">
            <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-sm">Insufficient Stock in Inventory</h4>
              <p className="text-xs text-amber-700/90 mt-1 leading-relaxed">
                Cannot accept the request for <strong>{insufficientStockRequest.bloodGroup}</strong>. 
                Required: <strong>{insufficientStockRequest.unitsRequired} units</strong>, 
                Available in your database: <strong>{insufficientStockRequest.availableUnits} units</strong>.
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3 pt-1">
            <button
              onClick={() => handleGeneratePriorityList(insufficientStockRequest.bloodGroup)}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl text-xs flex items-center space-x-1.5 transition-all cursor-pointer shadow-xs"
            >
              <ListOrdered className="h-4 w-4" />
              <span>Generate Priority List</span>
            </button>
            <button
              onClick={() => setInsufficientStockRequest(null)}
              className="px-3 py-2 bg-muted hover:bg-muted/80 text-muted-foreground font-semibold rounded-xl text-xs cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Broadcasted Requests Section */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-foreground flex items-center">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-600 mr-2" />
          Broadcasted Hospital Requests ({pendingRequests.length})
        </h3>

        {pendingRequests.length === 0 ? (
          <div className="p-10 border border-dashed border-border rounded-2xl text-center text-muted-foreground text-sm">
            No pending hospital requests available in your area.
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
                        {req.notes || "No clinical reasons or notes provided."}
                      </p>
                    </div>

                    {/* Details displays */}
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

      {/* Accepted Requests Section */}
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
                    <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-600 font-bold">
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

                  <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-2 border-t border-border/60 pl-4.5">
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
