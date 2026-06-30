"use client";

import { useState } from "react";
import {
  Plus,
  Minus,
  Database,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Droplet
} from "lucide-react";

interface InventoryItem {
  id?: string;
  bloodGroup: string;
  units: number;
  updatedAt?: string | Date;
}

interface InventoryManagerProps {
  bloodBankId: string;
  initialInventory: InventoryItem[];
}

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export default function InventoryManager({ bloodBankId, initialInventory }: InventoryManagerProps) {
  // Normalize inventory so all 8 groups exist in local state
  const getNormalizedInventory = () => {
    return BLOOD_GROUPS.map((group) => {
      const existing = initialInventory.find((item) => item.bloodGroup === group);
      return {
        bloodGroup: group,
        units: existing?.units ?? 0,
        updatedAt: existing?.updatedAt ? new Date(existing.updatedAt) : new Date(),
      };
    });
  };

  const [inventory, setInventory] = useState(getNormalizedInventory());
  const [adjustmentValues, setAdjustmentValues] = useState<Record<string, number>>({});
  const [loadingGroup, setLoadingGroup] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleValueChange = (group: string, val: string) => {
    const parsed = parseInt(val, 10);
    setAdjustmentValues((prev) => ({
      ...prev,
      [group]: isNaN(parsed) ? 1 : Math.max(1, parsed),
    }));
  };

  const handleAdjustInventory = async (group: string, isAdd: boolean) => {
    const changeValue = adjustmentValues[group] ?? 1;
    const delta = isAdd ? changeValue : -changeValue;

    const currentItem = inventory.find((item) => item.bloodGroup === group);
    const currentUnits = currentItem?.units ?? 0;
    const nextUnits = currentUnits + delta;

    // Validate client-side to prevent negative counts
    if (nextUnits < 0) {
      setActionError(`Validation Error: Units for ${group} cannot fall below zero.`);
      setSuccessMessage(null);
      return;
    }

    setLoadingGroup(group);
    setActionError(null);
    setSuccessMessage(null);

    try {
      const res = await fetch("/api/inventory/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bloodBankId,
          bloodGroup: group,
          unitsDelta: delta,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update inventory");
      }

      // Update state local variables on success
      setInventory((prev) =>
        prev.map((item) =>
          item.bloodGroup === group
            ? { ...item, units: data.inventory.units, updatedAt: new Date() }
            : item
        )
      );

      setSuccessMessage(`Inventory for ${group} successfully adjusted by ${delta > 0 ? "+" : ""}${delta} units!`);
      // Clear adjustment input
      setAdjustmentValues((prev) => ({ ...prev, [group]: 1 }));
    } catch (err: any) {
      setActionError(err.message || "Failed to save updates.");
    } finally {
      setLoadingGroup(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header operations banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">Operations / Stock Manager</span>
          <h2 className="text-2xl font-bold text-foreground mt-1">Live Blood Inventory Management</h2>
          <p className="text-muted-foreground text-xs mt-1">
            Manually add or withdraw blood units for quality checks, transfers, or inventory reconciliations.
          </p>
        </div>
      </div>

      {/* Success and Error Toasts */}
      {successMessage && (
        <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center space-x-3 text-green-600 text-xs animate-in fade-in duration-200">
          <CheckCircle2 className="h-4.5 w-4.5 shrink-0" />
          <span className="font-medium">{successMessage}</span>
        </div>
      )}

      {actionError && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center space-x-3 text-red-600 text-xs animate-in fade-in duration-200">
          <AlertTriangle className="h-4.5 w-4.5 shrink-0" />
          <span className="font-medium">{actionError}</span>
        </div>
      )}

      {/* Inventory Items Layout grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {inventory.map((item) => {
          const changeVal = adjustmentValues[item.bloodGroup] ?? 1;
          const isPending = loadingGroup === item.bloodGroup;

          return (
            <div
              key={item.bloodGroup}
              className="bg-card border border-border rounded-2xl p-5 shadow-sm hover:border-primary/20 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-600">
                    <Droplet className="h-5 w-5 fill-red-600" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-foreground text-base">{item.bloodGroup} Group</h3>
                    <div className="flex items-center space-x-1.5 text-[10px] text-muted-foreground mt-0.5">
                      <Calendar className="h-3 w-3" />
                      <span>Updated: {item.updatedAt ? new Date(item.updatedAt).toLocaleTimeString() : "Never"}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-2xl font-black text-foreground block">{item.units}</span>
                  <span className="text-[9px] uppercase font-bold tracking-wider text-muted-foreground">units available</span>
                </div>
              </div>

              {/* Adjust Panel Form */}
              <div className="flex items-center space-x-3 pt-3 border-t border-border">
                <input
                  type="number"
                  min="1"
                  value={changeVal}
                  onChange={(e) => handleValueChange(item.bloodGroup, e.target.value)}
                  className="w-16 px-2.5 py-2 bg-muted/40 border border-border rounded-xl text-center text-sm font-semibold focus:outline-none focus:border-primary/50"
                  disabled={isPending}
                />
                
                {/* Remove units */}
                <button
                  onClick={() => handleAdjustInventory(item.bloodGroup, false)}
                  disabled={isPending || item.units <= 0}
                  className="flex-1 py-2 bg-muted hover:bg-muted/80 text-muted-foreground border border-border rounded-xl font-semibold text-xs flex items-center justify-center space-x-1 cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Minus className="h-3.5 w-3.5" />
                  <span>Remove</span>
                </button>

                {/* Add units */}
                <button
                  onClick={() => handleAdjustInventory(item.bloodGroup, true)}
                  disabled={isPending}
                  className="flex-1 py-2 bg-primary hover:bg-primary/95 text-primary-foreground rounded-xl font-semibold text-xs flex items-center justify-center space-x-1 cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
                >
                  {isPending ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Plus className="h-3.5 w-3.5" />
                  )}
                  <span>Add Units</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
