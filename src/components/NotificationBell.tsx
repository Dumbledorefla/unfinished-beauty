import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell, CheckCheck, CreditCard, Calendar,
  Star, Info, MessageCircle, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNotifications } from "@/hooks/useNotifications";

const typeIcons: Record<string, React.ElementType> = {
  payment: CreditCard,
  consultation: Calendar,
  reading: Star,
  system: Info,
  message: MessageCircle,
  info: Info,
};

const typeColors: Record<string, string> = {
  payment: "text-emerald-400 bg-emerald-500/15",
  consultation: "text-blue-400 bg-blue-500/15",
  reading: "text-amber-400 bg-amber-500/15",
  system: "text-foreground/60 bg-secondary",
  message: "text-pink-400 bg-pink-500/15",
  info: "text-foreground/60 bg-secondary",
};

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const date = new Date(dateStr).getTime();
  const diff = now - date;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "agora";
  if (minutes < 60) return `${minutes}min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return new Date(dateStr).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

export default function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const handleNotificationClick = async (notif: typeof notifications[0]) => {
    if (!notif.read_at) {
      await markAsRead(notif.id);
    }
    if (notif.link) {
      navigate(notif.link);
      setOpen(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg text-foreground/70 hover:text-primary hover:bg-primary/10 transition-all duration-200"
        aria-label={`Notificações${unreadCount > 0 ? ` (${unreadCount} não lidas)` : ""}`}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </motion.span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-popover/95 backdrop-blur-xl rounded-xl border border-primary/20 shadow-2xl shadow-black/40 overflow-hidden z-50"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-primary/10">
              <h3 className="font-serif font-semibold text-foreground text-sm">
                Notificações
              </h3>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllAsRead}
                    className="text-xs h-7 text-primary hover:text-primary"
                  >
                    <CheckCheck className="w-3.5 h-3.5 mr-1" />
                    Marcar todas
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setOpen(false)}
                  className="h-7 w-7"
                >
                  <X className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>

            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="py-12 text-center">
                  <Bell className="w-8 h-8 mx-auto text-foreground/20 mb-2" />
                  <p className="text-sm text-foreground/40">Nenhuma notificação</p>
                </div>
              ) : (
                notifications.map((notif) => {
                  const Icon = typeIcons[notif.type] || Info;
                  const colorClass = typeColors[notif.type] || typeColors.info;
                  const isUnread = !notif.read_at;

                  return (
                    <button
                      key={notif.id}
                      onClick={() => handleNotificationClick(notif)}
                      className={`w-full flex gap-3 px-4 py-3 text-left hover:bg-primary/5 transition-colors border-b border-primary/5 last:border-0 ${
                        isUnread ? "bg-primary/5" : ""
                      }`}
                    >
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${colorClass}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className={`text-sm font-medium truncate ${isUnread ? "text-foreground" : "text-foreground/70"}`}>
                            {notif.title}
                          </p>
                          {isUnread && (
                            <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-foreground/50 line-clamp-2 mt-0.5">
                          {notif.message}
                        </p>
                        <p className="text-[10px] text-foreground/30 mt-1">
                          {timeAgo(notif.created_at)}
                        </p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
