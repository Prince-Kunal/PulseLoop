"use client";

import { useState } from "react";
import { X, Loader2, AlertTriangle, Droplet } from "lucide-react";

interface RaiseRequestModalProps {
  hospitalId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const URGENCY_LEVELS = [
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
  { value: "CRITICAL", label: "Critical" }
];

export default function RaiseRequestModal({
  hospitalId,
  isOpen,
  onClose,
  onSuccess,
}: RaiseRequestModalProps) {
  const [bloodGroup, setBloodGroup] = useState("O+");
  const [unitsRequired, setUnitsRequired] = useState("1");
  const [urgency, setUrgency] = useState("MEDIUM");
  const [notes, setNotes] = useState("");
  const [patientAge, setPatientAge] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const units = parseInt(unitsRequired, 10);
    if (isNaN(units) || units <= 0) {
      setFormError("Units required must be a positive integer.");
      return;
    }

    const age = patientAge ? parseInt(patientAge, 10) : null;
    if (age !== null && (isNaN(age) || age <= 0)) {
      setFormError("Patient age must be a positive integer.");
      return;
    }

    setIsLoading(true);
    setFormError(null);

    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hospitalId,
          bloodGroup,
          unitsRequired: units,
          urgency,
          notes: notes || undefined,
          patientAge: age || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to submit request");
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setFormError(err.message || "Failed to submit request.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-xs animate-fade-in" onClick={onClose} />

      {/* Modal Content */}
      <div className="bg-card border border-border rounded-2xl w-full max-w-lg p-6 shadow-2xl relative z-10 animate-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-center space-x-2.5 mb-4">
          <div className="h-9 w-9 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-600">
            <Droplet className="h-5 w-5 fill-red-600" />
          </div>
          <h3 className="text-lg font-bold text-foreground">Raise Blood Request</h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Blood Group Select */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground uppercase">Blood Group</label>
              <select
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
                className="w-full px-3 py-2 bg-muted/40 border border-border rounded-xl text-sm focus:outline-none focus:border-primary/50 cursor-pointer shadow-xs"
              >
                {BLOOD_GROUPS.map((bg) => (
                  <option key={bg} value={bg}>
                    {bg}
                  </option>
                ))}
              </select>
            </div>

            {/* Urgency */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground uppercase">Urgency</label>
              <select
                value={urgency}
                onChange={(e) => setUrgency(e.target.value)}
                className="w-full px-3 py-2 bg-muted/40 border border-border rounded-xl text-sm focus:outline-none focus:border-primary/50 cursor-pointer shadow-xs"
              >
                {URGENCY_LEVELS.map((u) => (
                  <option key={u.value} value={u.value}>
                    {u.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Units Required & Patient Age */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground uppercase">Units Required</label>
              <input
                type="number"
                min="1"
                value={unitsRequired}
                onChange={(e) => setUnitsRequired(e.target.value)}
                className="w-full px-3 py-2 bg-muted/40 border border-border rounded-xl text-sm focus:outline-none focus:border-primary/50"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-muted-foreground uppercase">Patient Age (Optional)</label>
              <input
                type="number"
                min="1"
                placeholder="e.g. 45"
                value={patientAge}
                onChange={(e) => setPatientAge(e.target.value)}
                className="w-full px-3 py-2 bg-muted/40 border border-border rounded-xl text-sm focus:outline-none focus:border-primary/50"
              />
            </div>
          </div>

          {/* Reason/Notes */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-muted-foreground uppercase">Reason / Notes</label>
            <textarea
              placeholder="e.g. Emergency bypass surgery, trauma response notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full h-24 px-3 py-2 bg-muted/40 border border-border rounded-xl text-sm focus:outline-none focus:border-primary/50 resize-none"
            />
          </div>

          {formError && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-600 text-xs flex items-center space-x-2 animate-in fade-in">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Action Footer */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-muted hover:bg-muted/80 text-muted-foreground font-semibold rounded-xl text-xs cursor-pointer"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-primary hover:bg-primary/95 text-primary-foreground font-semibold rounded-xl text-xs flex items-center justify-center cursor-pointer shadow-xs"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Raise Request"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
