import { useEffect, useState } from "react";
import { X, CheckCheck, Trash2, Bell, ArrowRight } from "lucide-react";
import { notificationsApi, type NotificationItem } from "@/lib/api/notifications";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function NotificationsPanel({ open, onClose }: Props) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewing, setViewing] = useState<NotificationItem | null>(null);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await notificationsApi.list();
      setNotifications(res.data);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) fetchNotifications();
  }, [open]);

  const handleMarkAllRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true, read_at: new Date().toISOString() })));
    } catch {}
  };

  const handleDelete = async (id: string) => {
    try {
      await notificationsApi.delete(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      if (viewing?.id === id) setViewing(null);
    } catch {}
  };

  const handleView = async (n: NotificationItem) => {
    if (!n.is_read) {
      try {
        await notificationsApi.markAsRead(n.id);
        setNotifications((prev) => prev.map((x) => (x.id === n.id ? { ...x, is_read: true, read_at: new Date().toISOString() } : x)));
      } catch {}
    }
    setViewing(n);
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <>
      {open && <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm" onClick={onClose} />}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-full max-w-md bg-background/95 backdrop-blur-xl border-l border-border shadow-2xl transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-5 h-14 border-b border-border">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-muted-foreground" />
            <h2 className="font-display text-base font-bold">Notifications</h2>
            {unreadCount > 0 && (
              <span className="text-[11px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">{unreadCount} new</span>
            )}
          </div>
          <button onClick={onClose} className="h-8 w-8 grid place-items-center rounded-md hover:bg-secondary text-muted-foreground cursor-pointer">
            <X className="h-4 w-4" />
          </button>
        </div>

        {viewing ? (
          <div className="p-5 space-y-4">
            <button onClick={() => setViewing(null)} className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 cursor-pointer">
              <ArrowRight className="h-3.5 w-3.5 rotate-180" /> Back
            </button>
            <div>
              <h3 className="font-display text-lg font-bold">{viewing.title}</h3>
              <p className="text-[11px] text-muted-foreground mt-1">{new Date(viewing.created_at).toLocaleString()}</p>
            </div>
            <div className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{viewing.body || "No additional details."}</div>
          </div>
        ) : (
          <div className="flex flex-col h-[calc(100%-3.5rem)]">
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                  <Bell className="h-8 w-8 mb-3 opacity-40" />
                  <p className="text-sm font-medium">No notifications yet</p>
                  <p className="text-xs mt-1">We'll notify you when something arrives.</p>
                </div>
              ) : (
                <>
                  {notifications.length > 0 && unreadCount > 0 && (
                    <div className="px-4 pt-2 pb-1">
                      <button onClick={handleMarkAllRead} className="flex items-center gap-1.5 text-xs font-medium text-primary hover:underline cursor-pointer">
                        <CheckCheck className="h-3.5 w-3.5" /> Mark all as read
                      </button>
                    </div>
                  )}
                  {notifications.map((n, i) => (
                    <div
                      key={n.id}
                      className={`group flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-secondary/50 transition-colors ${
                        i < notifications.length - 1 ? "border-b border-border" : ""
                      } ${!n.is_read ? "bg-primary/[0.02]" : ""}`}
                      onClick={() => handleView(n)}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          {!n.is_read && <span className="h-2 w-2 rounded-full bg-primary shrink-0" />}
                          <h4 className={`text-sm truncate ${n.is_read ? "font-medium text-foreground" : "font-semibold text-foreground"}`}>
                            {n.title}
                          </h4>
                        </div>
                        {n.body && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{n.body}</p>}
                        <p className="text-[10px] text-muted-foreground/60 mt-0.5">{new Date(n.created_at).toLocaleString()}</p>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(n.id); }}
                        className="shrink-0 h-6 w-6 grid place-items-center rounded text-muted-foreground opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive transition-all cursor-pointer"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
