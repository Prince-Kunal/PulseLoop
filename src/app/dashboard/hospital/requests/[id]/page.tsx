import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import DashboardShell from "@/components/DashboardShell";
import Link from "next/link";
import {
  ArrowLeft,
  Droplet,
  Calendar,
  Clock,
  MapPin,
  Building,
  User,
  CheckCircle2,
  HelpCircle,
  XCircle,
  AlertCircle
} from "lucide-react";

export default async function RequestDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
  }

  // Get hospital profile
  const hospitalProfile = await prisma.hospitalProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!hospitalProfile) {
    redirect("/auth/signin");
  }

  // Query blood request with hospital and blood bank details
  const requestRecord = await prisma.bloodRequest.findUnique({
    where: { id },
    include: {
      hospital: true,
      bloodBank: true,
    },
  });

  // Verify request exists and belongs to this hospital
  if (!requestRecord || requestRecord.hospitalId !== hospitalProfile.id) {
    redirect("/dashboard/hospital/requests");
  }

  // Setup status styles
  const getStatusBadge = (status: string) => {
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
      case "EXPIRED":
        return "bg-muted border-border text-muted-foreground";
      default:
        return "bg-muted border-border text-muted-foreground";
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
        return "bg-red-500/10 text-red-600 border-red-500/20 animate-pulse";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  // Stepper timeline configuration
  const getTimelineSteps = (status: string) => {
    const isRejected = status === "REJECTED";
    const isExpired = status === "EXPIRED";

    return [
      {
        title: "Request Raised",
        description: "Blood request has been logged in PulseLoop operations.",
        completed: true,
        current: false,
      },
      {
        title: "Blood Banks Notified",
        description: "Broadcast alerts sent to all nearby blood bank hubs.",
        completed: true,
        current: status === "PENDING",
      },
      {
        title: isRejected ? "Request Rejected" : (isExpired ? "Request Expired" : "Accepted by Blood Bank"),
        description: isRejected 
          ? "Request rejected due to stock shortage or operational reasons." 
          : (isExpired ? "Request expired without response." : "A nearby blood bank hub has accepted to fulfill the request."),
        completed: ["ACCEPTED", "IN_PROGRESS", "FULFILLED"].includes(status),
        current: status === "ACCEPTED",
        failed: isRejected || isExpired,
      },
      {
        title: "Processing & Checked",
        description: "Blood units matches and safety checks are in progress.",
        completed: ["IN_PROGRESS", "FULFILLED"].includes(status),
        current: status === "IN_PROGRESS",
        skipped: isRejected || isExpired,
      },
      {
        title: "Delivered & Fulfilled",
        description: "Blood units successfully delivered to the hospital ward.",
        completed: status === "FULFILLED",
        current: false,
        skipped: isRejected || isExpired,
      },
    ];
  };

  const steps = getTimelineSteps(requestRecord.status);

  return (
    <DashboardShell
      role="HOSPITAL"
      userEmail={session.user.email}
      userName={hospitalProfile.hospitalName}
    >
      <div className="space-y-6">
        {/* Back Link Header */}
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard/hospital/requests"
            className="flex items-center text-xs text-muted-foreground hover:text-foreground font-semibold transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Back to Requests
          </Link>
          <div className="flex items-center space-x-2">
            <span className={`text-xs px-2.5 py-1 rounded-full border font-bold ${getUrgencyBadge(requestRecord.urgency)}`}>
              {requestRecord.urgency} Urgency
            </span>
            <span className={`text-xs px-2.5 py-1 rounded-full border font-bold ${getStatusBadge(requestRecord.status)}`}>
              {requestRecord.status}
            </span>
          </div>
        </div>

        {/* Branding Title */}
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">Intake / Tracker</span>
          <h2 className="text-2xl font-bold text-foreground mt-1">Request Details</h2>
          <p className="text-muted-foreground text-xs mt-1">
            Raised by {hospitalProfile.hospitalName} for {requestRecord.unitsRequired} units of {requestRecord.bloodGroup}.
          </p>
        </div>

        {/* Layout details split */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Timeline side */}
          <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-6 shadow-md space-y-6">
            <h3 className="text-base font-bold text-foreground pb-3 border-b border-border">Request Status Timeline</h3>

            {/* Stepper Stepper */}
            <div className="relative border-l-2 border-border ml-3.5 pl-6 space-y-6 pb-2">
              {steps.map((step, idx) => {
                const getStepIndicator = () => {
                  if (step.completed) {
                    return (
                      <div className="absolute -left-9 top-0.5 h-6 w-6 rounded-full bg-green-500/20 border border-green-500 text-green-600 flex items-center justify-center">
                        <CheckCircle2 className="h-4 w-4 fill-green-500 text-white" />
                      </div>
                    );
                  }
                  if (step.failed) {
                    return (
                      <div className="absolute -left-9 top-0.5 h-6 w-6 rounded-full bg-red-500/20 border border-red-500 text-red-600 flex items-center justify-center">
                        <XCircle className="h-4.5 w-4.5 fill-red-500 text-white" />
                      </div>
                    );
                  }
                  if (step.current) {
                    return (
                      <div className="absolute -left-9 top-0.5 h-6 w-6 rounded-full bg-primary/20 border border-primary text-primary flex items-center justify-center animate-pulse">
                        <AlertCircle className="h-4.5 w-4.5 fill-primary text-white" />
                      </div>
                    );
                  }
                  if (step.skipped) {
                    return (
                      <div className="absolute -left-9 top-0.5 h-6 w-6 rounded-full bg-muted border border-border text-muted-foreground/60 flex items-center justify-center">
                        <XCircle className="h-4 w-4" />
                      </div>
                    );
                  }
                  return (
                    <div className="absolute -left-9 top-0.5 h-6 w-6 rounded-full bg-card border border-border text-muted-foreground flex items-center justify-center">
                      <HelpCircle className="h-4 w-4" />
                    </div>
                  );
                };

                return (
                  <div key={idx} className="relative space-y-1">
                    {getStepIndicator()}
                    <h4 className={`text-xs font-bold ${
                      step.completed ? "text-foreground" : (step.failed ? "text-red-600 font-extrabold" : (step.current ? "text-primary font-extrabold" : "text-muted-foreground"))
                    }`}>
                      {step.title}
                    </h4>
                    <p className="text-[11px] text-muted-foreground/90 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Details Sidebar card */}
          <div className="space-y-6">
            {/* Blood Intake Summary Card */}
            <div className="bg-card border border-border rounded-2xl p-5 shadow-md space-y-4">
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider text-muted-foreground">Clinical Parameters</h3>
              
              <div className="flex items-center space-x-3 bg-red-500/5 border border-red-500/10 p-3 rounded-xl">
                <Droplet className="h-6 w-6 fill-red-600 text-red-600" />
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase font-bold block">Required Group</span>
                  <span className="text-base font-extrabold text-foreground">{requestRecord.bloodGroup}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-muted/20 border border-border rounded-xl">
                  <span className="text-[9px] text-muted-foreground uppercase font-bold block">Units Needed</span>
                  <span className="text-sm font-bold text-foreground mt-0.5 block">{requestRecord.unitsRequired} Units</span>
                </div>
                <div className="p-3 bg-muted/20 border border-border rounded-xl">
                  <span className="text-[9px] text-muted-foreground uppercase font-bold block">Patient Age</span>
                  <span className="text-sm font-bold text-foreground mt-0.5 block">
                    {requestRecord.patientAge ? `${requestRecord.patientAge} Years` : "Unknown"}
                  </span>
                </div>
              </div>

              <div className="space-y-1 pt-1">
                <span className="text-[10px] text-muted-foreground uppercase font-bold block">Clinical Indication</span>
                <p className="text-xs text-foreground bg-muted/30 p-3 border border-border rounded-xl min-h-16 leading-relaxed">
                  {requestRecord.notes || "No clinical reasons or notes logged."}
                </p>
              </div>

              <div className="flex items-center justify-between text-[10px] text-muted-foreground/80 pt-2 border-t border-border/60">
                <div className="flex items-center space-x-1">
                  <Calendar className="h-3 w-3" />
                  <span>Raised: {new Date(requestRecord.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="h-3 w-3" />
                  <span>Time: {new Date(requestRecord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            </div>

            {/* Assigned Blood Bank (if accepted) */}
            {requestRecord.bloodBank && (
              <div className="bg-card border border-border rounded-2xl p-5 shadow-md space-y-3.5 animate-in slide-in-from-bottom-2 duration-300">
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider text-muted-foreground">Assigned Provider</h3>
                
                <div className="flex items-start space-x-3">
                  <div className="h-9 w-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-600 shrink-0 mt-0.5">
                    <Building className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground text-sm">{requestRecord.bloodBank.bloodBankName}</h4>
                    <span className="text-[9px] font-semibold text-primary font-mono block mt-0.5">
                      #LH-{requestRecord.bloodBank.id.slice(-6).toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="text-[11px] text-muted-foreground pt-2 border-t border-border/60 space-y-1.5">
                  <div className="flex items-center space-x-1.5">
                    <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span>Coordinates: {requestRecord.bloodBank.latitude}, {requestRecord.bloodBank.longitude}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
