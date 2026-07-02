"use client";

import { useState } from "react";
import {
  Bell,
  AlertTriangle,
  Gift,
  Calendar,
  Megaphone,
  CheckCircle2,
  Trash2,
  Inbox,
  Loader2,
  Eye
} from "lucide-react";

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string | Date;
}

interface NotificationsConsoleProps {
  initialNotifications: NotificationItem[];
}

export default function NotificationsConsole({
  initialNotifications,
}: NotificationsConsoleProps) {
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);
  const [filter, setFilter] = useState<"ALL" | "UNREAD" | "READ">("ALL");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // Actions
  const handleMarkAsRead = async (id: string) => {
    setLoadingId(id);
    try {
      const res = await fetch("/api/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId: id }),
      });
      if (res.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    setLoadingId(id);
    try {
      const res = await fetch("/api/notifications", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId: id }),
      });
      if (res.ok) {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingId(null);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const res = await fetch("/api/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "MARK_ALL_READ" }),
      });
      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteAllRead = async () => {
    try {
      const res = await fetch("/api/notifications", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "DELETE_ALL_READ" }),
      });
      if (res.ok) {
        setNotifications((prev) => prev.filter((n) => !n.isRead));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "EMERGENCY_ALERT":
        return <AlertTriangle className="h-4.5 w-4.5 text-red-500" />;
      case "REWARD_UNLOCK":
        return <Gift className="h-4.5 w-4.5 text-amber-500" />;
      case "ELIGIBILITY_REMINDER":
        return <Calendar className="h-4.5 w-4.5 text-green-500" />;
      case "DRIVE_ANNOUNCEMENT":
        return <Megaphone className="h-4.5 w-4.5 text-blue-500" />;
      default:
        return <Bell className="h-4.5 w-4.5 text-primary" />;
    }
  };

  const getNotificationBg = (type: string, isRead: boolean) => {
    if (isRead) return "bg-card border-border/70";
    switch (type) {
      case "EMERGENCY_ALERT":
        return "bg-red-500/[0.03] border-red-500/15";
      case "REWARD_UNLOCK":
        return "bg-amber-500/[0.03] border-amber-500/15";
      case "ELIGIBILITY_REMINDER":
        return "bg-green-500/[0.03] border-green-500/15";
      case "DRIVE_ANNOUNCEMENT":
        return "bg-blue-500/[0.03] border-blue-500/15";
      default:
        return "bg-primary/[0.02] border-primary/10";
    }
  };

  // Filter logic
  const filteredNotifications = notifications.filter((n) => {
    if (filter === "UNREAD") return !n.isRead;
    if (filter === "READ") return n.isRead;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">Inboxes</span>
          <h2 className="text-2xl font-bold text-foreground mt-1">Notification Center</h2>
          <p className="text-muted-foreground text-xs mt-1">
            Access drive alerts, reward releases, eligibility confirmations, and emergency matches.
          </p>
        </div>

        {/* Bulk controls */}
        {notifications.length > 0 && (
          <div className="flex items-center space-x-2 self-start sm:self-auto">
            <button
              onClick={handleMarkAllRead}
              className="px-3 py-1.5 bg-muted hover:bg-muted/80 text-foreground font-semibold rounded-lg text-[10px] flex items-center space-x-1 transition-colors cursor-pointer"
            >
              <Eye className="h-3.5 w-3.5" />
              <span>Mark All Read</span>
            </button>
            <button
              onClick={handleDeleteAllRead}
              className="px-3 py-1.5 bg-muted hover:bg-red-500/10 hover:text-red-600 text-foreground font-semibold rounded-lg text-[10px] flex items-center space-x-1 transition-all cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Delete All Read</span>
            </button>
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 bg-card border border-border p-1.5 rounded-xl self-start w-fit">
        <button
          onClick={() => setFilter("ALL")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
            filter === "ALL" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setFilter("UNREAD")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
            filter === "UNREAD" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Unread ({unreadCount})
        </button>
        <button
          onClick={() => setFilter("READ")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
            filter === "READ" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Read ({notifications.length - unreadCount})
        </button>
      </div>

      {/* Alerts Feed */}
      {filteredNotifications.length === 0 ? (
        <div className="p-16 border border-dashed border-border rounded-2xl text-center space-y-3">
          <Inbox className="h-10 w-10 text-muted-foreground mx-auto" />
          <h4 className="text-xs font-bold text-foreground">Inbox is completely clear</h4>
          <p className="text-muted-foreground text-[11px] max-w-xs mx-auto">
            You don't have any notifications in this tab filter.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredNotifications.map((notif) => {
            const isLoading = loadingId === notif.id;

            return (
              <div
                key={notif.id}
                className={`border rounded-2xl p-4.5 flex items-start justify-between gap-4 transition-all shadow-xs ${getNotificationBg(
                  notif.type,
                  notif.isRead
                )}`}
              >
                <div className="flex items-start space-x-3.5">
                  <div className="h-9 w-9 rounded-xl bg-card border border-border flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                    {getNotificationIcon(notif.type)}
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center space-x-2">
                      <h4 className={`text-xs font-bold ${notif.isRead ? "text-foreground/90" : "text-foreground font-black"}`}>
                        {notif.title}
                      </h4>
                      {!notif.isRead && (
                        <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                      )}
                    </div>
                    <p className="text-muted-foreground text-xs leading-relaxed max-w-2xl">
                      {notif.message}
                    </p>
                    <span className="text-[9px] font-mono text-muted-foreground/80 block mt-1">
                      {new Date(notif.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 shrink-0 self-center sm:self-auto">
                  {!notif.isRead && (
                    <button
                      onClick={() => handleMarkAsRead(notif.id)}
                      disabled={isLoading}
                      title="Mark as read"
                      className="p-2 hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg cursor-pointer transition-colors"
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4" />
                      )}
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(notif.id)}
                    disabled={isLoading}
                    title="Delete notification"
                    className="p-2 hover:bg-red-500/10 text-muted-foreground hover:text-red-600 rounded-lg cursor-pointer transition-all"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
