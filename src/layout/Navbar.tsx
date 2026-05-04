import { AnimatePresence, motion } from "framer-motion";
import { Bell, CheckCheck, Clock, LogOut, ShieldCheck, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  AppNotification,
  NotificationController,
} from "../controllers/NotificationController";

const T = {
  bg:          "#0D0F14",
  border:      "#252932",
  surface:     "#13161D",
  surfaceHover:"#1A1E27",
  accent:      "#E8A838",
  accentDim:   "rgba(232,168,56,0.12)",
  textPrimary: "#F0EDE6",
  textSec:     "#7A8194",
  textMuted:   "#454B5C",
  blue:        "#5B9CF6",
  blueDim:     "rgba(91,156,246,0.12)",
  red:         "#E85656",
  redDim:      "rgba(232,86,86,0.12)",
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const isAdmin = user?.role === "admin";
  const role    = isAdmin ? "admin" : "user";

  const initials = user?.name
    ? user.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  const [open, setOpen]     = useState(false);
  const [notifs, setNotifs] = useState<AppNotification[]>([]);
  const [unread, setUnread] = useState(0);
  const panelRef            = useRef<HTMLDivElement>(null);

  const reload = () => {
    const all = NotificationController.getAll(role);
    setNotifs(all);
    setUnread(NotificationController.unreadCount(role));
  };

  // Load on mount + poll every 3s so new tickets/status changes appear live
  useEffect(() => {
    reload();
    const interval = setInterval(reload, 3000);
    return () => clearInterval(interval);
  }, [role]);

  // Close panel on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleOpen = () => setOpen((v) => !v);

  const handleMarkAllRead = () => {
    NotificationController.markAllRead(role);
    reload();
  };

  const formatTime = (iso: string) => {
    const diff  = Date.now() - new Date(iso).getTime();
    const mins  = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days  = Math.floor(diff / 86400000);
    if (mins  < 1)  return "Just now";
    if (mins  < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500&display=swap');

        .nb-root {
          height: 58px;
          min-height: 58px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 1.75rem;
          background: ${T.bg};
          border-bottom: 1px solid ${T.border};
          font-family: 'DM Sans', sans-serif;
          box-sizing: border-box;
          position: sticky;
          top: 0;
          z-index: 10;
        }

        .nb-left {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: ${T.textSec};
          font-size: 13.5px;
        }

        .nb-role-pill {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 3px 10px;
          border-radius: 20px;
          font-size: 11.5px;
          font-weight: 500;
        }

        .nb-right {
          display: flex;
          align-items: center;
          gap: 0.625rem;
          position: relative;
        }

        .nb-icon-btn {
          all: unset;
          width: 34px;
          height: 34px;
          border-radius: 9px;
          border: 1px solid ${T.border};
          background: transparent;
          display: flex;
          align-items: center;
          justify-content: center;
          color: ${T.textSec};
          cursor: pointer;
          transition: border-color 0.15s, color 0.15s, background 0.15s;
          position: relative;
        }
        .nb-icon-btn:hover,
        .nb-icon-btn.active {
          border-color: ${T.accent};
          color: ${T.accent};
          background: ${T.accentDim};
        }

        .nb-notif-dot {
          position: absolute;
          top: 5px;
          right: 5px;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: ${T.red};
          border: 1.5px solid ${T.bg};
        }

        /* ── Dropdown ── */
        .nb-panel {
          position: absolute;
          top: calc(100% + 10px);
          right: 0;
          width: 340px;
          background: ${T.surface};
          border: 1px solid ${T.border};
          border-radius: 16px;
          box-shadow: 0 16px 48px rgba(0,0,0,0.5);
          overflow: hidden;
          z-index: 100;
        }

        .nb-panel-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem 1.125rem 0.75rem;
          border-bottom: 1px solid ${T.border};
        }
        .nb-panel-title {
          font-size: 13.5px;
          font-weight: 500;
          color: ${T.textPrimary};
          margin: 0;
          display: flex;
          align-items: center;
          gap: 7px;
        }
        .nb-unread-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 18px;
          height: 18px;
          padding: 0 5px;
          border-radius: 20px;
          background: ${T.red};
          color: #fff;
          font-size: 10.5px;
          font-weight: 600;
        }
        .nb-mark-read {
          all: unset;
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          color: ${T.textMuted};
          cursor: pointer;
          transition: color 0.15s;
          font-family: 'DM Sans', sans-serif;
        }
        .nb-mark-read:hover { color: ${T.accent}; }

        .nb-notif-list {
          max-height: 320px;
          overflow-y: auto;
        }
        .nb-notif-list::-webkit-scrollbar { width: 4px; }
        .nb-notif-list::-webkit-scrollbar-track { background: transparent; }
        .nb-notif-list::-webkit-scrollbar-thumb {
          background: ${T.border};
          border-radius: 2px;
        }

        .nb-notif-item {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          padding: 0.875rem 1.125rem;
          border-bottom: 1px solid ${T.border};
          transition: background 0.15s;
        }
        .nb-notif-item:last-child { border-bottom: none; }
        .nb-notif-item:hover { background: ${T.surfaceHover}; }
        .nb-notif-item.unread { background: rgba(232,168,56,0.04); }
        .nb-notif-item.unread:hover { background: rgba(232,168,56,0.07); }

        .nb-notif-indicator {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          flex-shrink: 0;
          margin-top: 5px;
          background: ${T.accent};
        }
        .nb-notif-indicator.read {
          background: transparent;
          border: 1px solid ${T.border};
        }

        .nb-notif-msg {
          flex: 1;
          font-size: 13px;
          color: ${T.textSec};
          line-height: 1.45;
          margin: 0;
        }
        .nb-notif-item.unread .nb-notif-msg { color: ${T.textPrimary}; }

        .nb-notif-time {
          font-size: 11px;
          color: ${T.textMuted};
          display: flex;
          align-items: center;
          gap: 3px;
          flex-shrink: 0;
          margin-top: 2px;
          white-space: nowrap;
        }

        .nb-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2.5rem 1rem;
          gap: 0.5rem;
          color: ${T.textMuted};
          font-size: 13px;
        }

        .nb-avatar {
          width: 34px;
          height: 34px;
          border-radius: 9px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          font-weight: 500;
          flex-shrink: 0;
        }

        .nb-user-name {
          font-size: 13.5px;
          font-weight: 500;
          color: ${T.textPrimary};
        }

        .nb-divider {
          width: 1px;
          height: 20px;
          background: ${T.border};
          margin: 0 0.25rem;
        }

        .nb-logout {
          all: unset;
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 0.45rem 0.875rem;
          border-radius: 9px;
          border: 1px solid ${T.border};
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          color: ${T.textSec};
          cursor: pointer;
          transition: all 0.15s;
        }
        .nb-logout:hover {
          border-color: ${T.red};
          color: ${T.red};
          background: ${T.redDim};
        }
      `}</style>

      <div className="nb-root">
        {/* Left */}
        <div className="nb-left">
          <span
            className="nb-role-pill"
            style={{
              background: isAdmin ? T.blueDim  : T.accentDim,
              color:      isAdmin ? T.blue     : T.accent,
              border:     `1px solid ${isAdmin ? "rgba(91,156,246,0.25)" : "rgba(232,168,56,0.25)"}`,
            }}
          >
            {isAdmin
              ? <ShieldCheck size={11} strokeWidth={2} />
              : <User        size={11} strokeWidth={2} />}
            {isAdmin ? "Admin Portal" : "User Portal"}
          </span>
        </div>

        {/* Right */}
        <div className="nb-right" ref={panelRef}>

          {/* Bell */}
          <motion.button
            className={`nb-icon-btn${open ? " active" : ""}`}
            whileTap={{ scale: 0.93 }}
            onClick={handleOpen}
          >
            <Bell size={15} strokeWidth={1.75} />
            {unread > 0 && <span className="nb-notif-dot" />}
          </motion.button>

          {/* Dropdown */}
          <AnimatePresence>
            {open && (
              <motion.div
                className="nb-panel"
                initial={{ opacity: 0, y: -8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0,  scale: 1    }}
                exit={{    opacity: 0, y: -8, scale: 0.97 }}
                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="nb-panel-head">
                  <p className="nb-panel-title">
                    Notifications
                    {unread > 0 && (
                      <span className="nb-unread-badge">{unread}</span>
                    )}
                  </p>
                  {unread > 0 && (
                    <button className="nb-mark-read" onClick={handleMarkAllRead}>
                      <CheckCheck size={12} strokeWidth={2} />
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="nb-notif-list">
                  {notifs.length === 0 ? (
                    <div className="nb-empty">
                      <Bell size={24} strokeWidth={1.25} />
                      <span>No notifications yet</span>
                    </div>
                  ) : (
                    notifs.map((n) => (
                      <div
                        key={n.id}
                        className={`nb-notif-item${n.read ? "" : " unread"}`}
                      >
                        <span className={`nb-notif-indicator${n.read ? " read" : ""}`} />
                        <p className="nb-notif-msg">{n.message}</p>
                        <span className="nb-notif-time">
                          <Clock size={10} strokeWidth={1.75} />
                          {formatTime(n.createdAt)}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="nb-divider" />

          <div
            className="nb-avatar"
            style={{
              background: isAdmin ? T.blueDim  : T.accentDim,
              color:      isAdmin ? T.blue     : T.accent,
              border:     `1px solid ${isAdmin ? "rgba(91,156,246,0.3)" : "rgba(232,168,56,0.3)"}`,
            }}
          >
            {initials}
          </div>

          <span className="nb-user-name">{user?.name ?? "Guest"}</span>

          <div className="nb-divider" />

          <motion.button className="nb-logout" onClick={logout} whileTap={{ scale: 0.97 }}>
            <LogOut size={14} strokeWidth={1.75} />
            Logout
          </motion.button>
        </div>
      </div>
    </>
  );
}