import { motion } from "framer-motion";
import { Bell, LogOut, ShieldCheck, User } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const T = {
  bg:         "#0D0F14",
  border:     "#252932",
  surface:    "#13161D",
  accent:     "#E8A838",
  accentDim:  "rgba(232,168,56,0.12)",
  textPrimary:"#F0EDE6",
  textSec:    "#7A8194",
  textMuted:  "#454B5C",
  blue:       "#5B9CF6",
  blueDim:    "rgba(91,156,246,0.12)",
  red:        "#E85656",
  redDim:     "rgba(232,86,86,0.12)",
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const isAdmin = user?.role === "admin";

  const initials = user?.name
    ? user.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()
    : "?";

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

        /* Left — breadcrumb/page context slot (children could inject here) */
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

        /* Right actions */
        .nb-right {
          display: flex;
          align-items: center;
          gap: 0.625rem;
        }

        /* Notification bell */
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
        .nb-icon-btn:hover {
          border-color: ${T.accent};
          color: ${T.accent};
          background: ${T.accentDim};
        }

        /* Notification dot */
        .nb-notif-dot {
          position: absolute;
          top: 6px;
          right: 6px;
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: ${T.red};
          border: 1.5px solid ${T.bg};
        }

        /* Avatar */
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

        /* Logout */
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
        {/* Left: role context */}
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

        {/* Right: bell + user + logout */}
        <div className="nb-right">
          {/* Notification bell */}
          <motion.button className="nb-icon-btn" whileTap={{ scale: 0.93 }}>
            <Bell size={15} strokeWidth={1.75} />
            <span className="nb-notif-dot" />
          </motion.button>

          <div className="nb-divider" />

          {/* Avatar + name */}
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

          {/* Logout */}
          <motion.button className="nb-logout" onClick={logout} whileTap={{ scale: 0.97 }}>
            <LogOut size={14} strokeWidth={1.75} />
            Logout
          </motion.button>
        </div>
      </div>
    </>
  );
}