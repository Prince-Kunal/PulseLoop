"use client";

import { useState } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Plus,
  Edit2,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  X,
  Compass
} from "lucide-react";

interface BloodDrive {
  id: string;
  title: string;
  description: string;
  date: string | Date;
  startTime: string;
  endTime: string;
  latitude: number;
  longitude: number;
  capacity: number;
  organizerId: string;
}

interface DrivesManagerProps {
  organizerId: string;
  initialDrives: BloodDrive[];
}

export default function DrivesManager({ organizerId, initialDrives }: DrivesManagerProps) {
  const [drives, setDrives] = useState<BloodDrive[]>(initialDrives);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDrive, setEditingDrive] = useState<BloodDrive | null>(null);

  // Form fields state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [capacity, setCapacity] = useState("");

  // Feedback states
  const [isLoading, setIsLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const openCreateModal = () => {
    setEditingDrive(null);
    setTitle("");
    setDescription("");
    setDate("");
    setStartTime("");
    setEndTime("");
    setLatitude("");
    setLongitude("");
    setCapacity("");
    setActionError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (drive: BloodDrive) => {
    setEditingDrive(drive);
    setTitle(drive.title);
    setDescription(drive.description);
    // Format date to YYYY-MM-DD
    const formattedDate = new Date(drive.date).toISOString().split("T")[0];
    setDate(formattedDate);
    setStartTime(drive.startTime);
    setEndTime(drive.endTime);
    setLatitude(drive.latitude.toString());
    setLongitude(drive.longitude.toString());
    setCapacity(drive.capacity.toString());
    setActionError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !date || !startTime || !endTime || !latitude || !longitude || !capacity) {
      setActionError("All fields are required.");
      return;
    }

    const parsedLat = parseFloat(latitude);
    const parsedLng = parseFloat(longitude);
    const parsedCap = parseInt(capacity, 10);

    if (isNaN(parsedLat) || isNaN(parsedLng)) {
      setActionError("Latitude and Longitude must be valid decimal coordinates.");
      return;
    }

    if (isNaN(parsedCap) || parsedCap <= 0) {
      setActionError("Capacity must be a positive integer.");
      return;
    }

    setIsLoading(true);
    setActionError(null);
    setSuccessMessage(null);

    const payload = {
      id: editingDrive?.id,
      title,
      description,
      date,
      startTime,
      endTime,
      latitude: parsedLat,
      longitude: parsedLng,
      capacity: parsedCap,
      organizerId,
    };

    try {
      const res = await fetch("/api/drives", {
        method: editingDrive ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to save blood drive");
      }

      if (editingDrive) {
        // Update local state list
        setDrives((prev) =>
          prev.map((d) => (d.id === editingDrive.id ? data.drive : d))
        );
        setSuccessMessage("Blood drive successfully updated!");
      } else {
        // Insert new item
        setDrives((prev) => [...prev, data.drive]);
        setSuccessMessage("Blood drive successfully scheduled!");
      }

      setIsModalOpen(false);
    } catch (err: any) {
      setActionError(err.message || "Failed to save operations.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to cancel and delete this blood drive?")) return;

    setActionError(null);
    setSuccessMessage(null);

    try {
      const res = await fetch(`/api/drives?id=${id}`, { method: "DELETE" });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to delete blood drive");
      }

      setDrives((prev) => prev.filter((d) => d.id !== id));
      setSuccessMessage("Blood drive deleted successfully.");
    } catch (err: any) {
      setActionError(err.message || "Failed to complete deletion.");
    }
  };

  // Divide upcoming vs past drives
  const getCategorizedDrives = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcoming: BloodDrive[] = [];
    const past: BloodDrive[] = [];

    drives.forEach((d) => {
      const driveDate = new Date(d.date);
      driveDate.setHours(0, 0, 0, 0);
      if (driveDate >= today) {
        upcoming.push(d);
      } else {
        past.push(d);
      }
    });

    // Sort upcoming ascending, past descending
    upcoming.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    past.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return { upcoming, past };
  };

  const { upcoming, past } = getCategorizedDrives();

  return (
    <div className="space-y-8">
      {/* Header section operations */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">Operations / Campaigns</span>
          <h2 className="text-2xl font-bold text-foreground mt-1">Manage Blood Drives</h2>
          <p className="text-muted-foreground text-xs mt-1">
            Schedule upcoming public donation drives, edit details, or archive past events.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 bg-primary hover:bg-primary/95 text-primary-foreground font-semibold rounded-xl text-xs flex items-center justify-center transition-all cursor-pointer shadow-xs shrink-0"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          Schedule Blood Drive
        </button>
      </div>

      {/* Action alerts */}
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

      {/* Upcoming campaigns */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-foreground flex items-center">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-primary mr-2" />
          Upcoming Blood Drives ({upcoming.length})
        </h3>
        {upcoming.length === 0 ? (
          <div className="p-8 border border-dashed border-border rounded-2xl text-center text-muted-foreground text-sm">
            No upcoming drives scheduled. Click "Schedule Blood Drive" to organize one.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {upcoming.map((drive) => (
              <div
                key={drive.id}
                className="bg-card border border-border rounded-2xl p-5 shadow-sm hover:border-primary/20 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3.5">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-foreground text-base truncate pr-2">{drive.title}</h4>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-green-500/10 border border-green-500/20 text-green-600 font-semibold tracking-wider shrink-0">
                      UPCOMING
                    </span>
                  </div>
                  <p className="text-muted-foreground text-xs line-clamp-2 leading-relaxed">
                    {drive.description}
                  </p>
                  
                  {/* Metadata display */}
                  <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-[11px] text-muted-foreground pt-2 border-t border-border/60">
                    <div className="flex items-center space-x-1.5">
                      <Calendar className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span>{new Date(drive.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <Clock className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span>{drive.startTime} - {drive.endTime}</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span className="truncate">Lat: {drive.latitude}, Lng: {drive.longitude}</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <Users className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span>Capacity: {drive.capacity} Donors</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-2.5 pt-4 mt-4 border-t border-border/60">
                  <button
                    onClick={() => openEditModal(drive)}
                    className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted border border-transparent hover:border-border rounded-xl transition-all cursor-pointer"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(drive.id)}
                    className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 border border-transparent hover:border-destructive/20 rounded-xl transition-all cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Past campaigns */}
      <div className="space-y-4 pt-4 border-t border-border">
        <h3 className="text-base font-bold text-foreground flex items-center">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-muted mr-2" />
          Past Blood Drives ({past.length})
        </h3>
        {past.length === 0 ? (
          <div className="text-muted-foreground text-xs italic pl-4">No past drives on record.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 opacity-75">
            {past.map((drive) => (
              <div
                key={drive.id}
                className="bg-card border border-border rounded-2xl p-5 shadow-xs flex flex-col justify-between"
              >
                <div className="space-y-3.5">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-muted-foreground text-base truncate pr-2">{drive.title}</h4>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-muted border border-border text-muted-foreground font-semibold tracking-wider shrink-0">
                      COMPLETED
                    </span>
                  </div>
                  <p className="text-muted-foreground/80 text-xs line-clamp-2 leading-relaxed">
                    {drive.description}
                  </p>
                  
                  {/* Metadata display */}
                  <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-[11px] text-muted-foreground pt-2 border-t border-border/60">
                    <div className="flex items-center space-x-1.5">
                      <Calendar className="h-3.5 w-3.5 shrink-0" />
                      <span>{new Date(drive.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <Clock className="h-3.5 w-3.5 shrink-0" />
                      <span>{drive.startTime} - {drive.endTime}</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <MapPin className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">Lat: {drive.latitude}, Lng: {drive.longitude}</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <Users className="h-3.5 w-3.5 shrink-0" />
                      <span>Capacity: {drive.capacity}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CRUD Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" onClick={() => setIsModalOpen(false)} />
          <div className="bg-card border border-border rounded-2xl w-full max-w-lg p-6 shadow-2xl relative z-10 animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 p-1 rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
            
            <h3 className="text-lg font-bold text-foreground mb-4">
              {editingDrive ? "Edit Blood Drive" : "Schedule New Blood Drive"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground uppercase">Drive Title</label>
                <input
                  type="text"
                  placeholder="e.g. Summer Saving Drive"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-muted/40 border border-border rounded-xl text-sm focus:outline-none focus:border-primary/50"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground uppercase">Description</label>
                <textarea
                  placeholder="Details about donation types, eligibility buffers..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full h-20 px-3 py-2 bg-muted/40 border border-border rounded-xl text-sm focus:outline-none focus:border-primary/50 resize-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground uppercase">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 bg-muted/40 border border-border rounded-xl text-sm focus:outline-none"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground uppercase">Capacity</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="e.g. 50"
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    className="w-full px-3 py-2 bg-muted/40 border border-border rounded-xl text-sm focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground uppercase">Start Time</label>
                  <input
                    type="text"
                    placeholder="e.g. 09:00 AM"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3 py-2 bg-muted/40 border border-border rounded-xl text-sm focus:outline-none"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground uppercase">End Time</label>
                  <input
                    type="text"
                    placeholder="e.g. 05:00 PM"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3 py-2 bg-muted/40 border border-border rounded-xl text-sm focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground uppercase">Latitude</label>
                  <input
                    type="text"
                    placeholder="e.g. 40.7128"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    className="w-full px-3 py-2 bg-muted/40 border border-border rounded-xl text-sm focus:outline-none"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-muted-foreground uppercase">Longitude</label>
                  <input
                    type="text"
                    placeholder="e.g. -74.006"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    className="w-full px-3 py-2 bg-muted/40 border border-border rounded-xl text-sm focus:outline-none"
                    required
                  />
                </div>
              </div>

              {actionError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-600 text-xs flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>{actionError}</span>
                </div>
              )}

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
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
                      Saving...
                    </>
                  ) : (
                    "Save Drive"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
