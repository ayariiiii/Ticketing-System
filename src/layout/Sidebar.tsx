import { motion } from "framer-motion";
import {
  Headphones,
  LayoutDashboard,
  Settings,
  ShieldCheck,
  Ticket,
  User
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const T = {
  bg:         "#0D0F14",
  border:     "#252932",
  accent:     "#E8A838",
  accentDim:  "rgba(232,168,56,0.12)",
  textPrimary:"#F0EDE6",
  textSec:    "#7A8194",
  textMuted:  "#454B5C",
  surface:    "#13161D",
};

interface NavItem {
  to:        string;
  label:     string;
  Icon:      React.ElementType;
  adminOnly?: boolean;
  userOnly?:  boolean;
}

// Static nav items — dashboard is resolved dynamically below based on role
const NAV_ITEMS: NavItem[] = [
  { to: "/tickets",  label: "Tickets",  Icon: Ticket,           adminOnly: true  },
  { to: "/profile",  label: "Profile",  Icon: User,             adminOnly: true  },
  { to: "/settings", label: "Settings", Icon: Settings,         adminOnly: true  },
];

export default function Sidebar() {
  const { user }     = useAuth();
  const { pathname } = useLocation();
  const isAdmin      = user?.role === "admin";

  // Role-aware dashboard entry — always first in the list
  const dashboardItem: NavItem = {
    to:    isAdmin ? "/admin/dashboard" : "/dashboard",
    label: "Dashboard",
    Icon:  LayoutDashboard,
  };

  const visibleItems = [
    dashboardItem,
    ...NAV_ITEMS.filter((item) => {
      if (item.adminOnly && !isAdmin) return false;
      if (item.userOnly  &&  isAdmin) return false;
      return true;
    }),
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500&display=swap');

        .sb-root {
          width: 220px;
          min-width: 220px;
          height: 100vh;
          background: ${T.bg};
          border-right: 1px solid ${T.border};
          display: flex;
          flex-direction: column;
          padding: 0;
          box-sizing: border-box;
          font-family: 'DM Sans', sans-serif;
          position: sticky;
          top: 0;
        }

        .sb-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 1.5rem 1.25rem 1.25rem;
          border-bottom: 1px solid ${T.border};
          margin-bottom: 0.5rem;
          text-decoration: none;
        }

        .sb-logo-icon {
          width: 34px;
          height: 34px;
          border-radius: 9px;
          background: rgba(232,168,56,0.12);
          border: 1px solid rgba(232,168,56,0.35);
          display: flex;
          align-items: center;
          justify-content: center;
          color: ${T.accent};
          flex-shrink: 0;
        }

        .sb-logo-text {
          font-size: 14px;
          font-weight: 500;
          color: ${T.textPrimary};
          line-height: 1.2;
        }
        .sb-logo-sub {
          font-size: 10.5px;
          color: ${T.textMuted};
          letter-spacing: 0.04em;
        }

        .sb-section {
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: ${T.textMuted};
          padding: 0.75rem 1.25rem 0.375rem;
        }

        .sb-nav {
          display: flex;
          flex-direction: column;
          gap: 2px;
          padding: 0 0.625rem;
          flex: 1;
        }

        .sb-link {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 0.6rem 0.875rem;
          border-radius: 10px;
          text-decoration: none;
          font-size: 13.5px;
          color: ${T.textSec};
          transition: background 0.15s, color 0.15s;
          position: relative;
        }

        .sb-link:hover {
          background: rgba(255,255,255,0.04);
          color: ${T.textPrimary};
        }

        .sb-link.active {
          background: ${T.accentDim};
          color: ${T.accent};
        }

        .sb-link.active .sb-link-icon { color: ${T.accent}; }

        .sb-link-icon {
          flex-shrink: 0;
          color: ${T.textMuted};
          transition: color 0.15s;
        }
        .sb-link:hover .sb-link-icon { color: ${T.textSec}; }

        .sb-link.active::before {
          content: '';
          position: absolute;
          left: 0;
          top: 20%;
          height: 60%;
          width: 3px;
          border-radius: 0 3px 3px 0;
          background: ${T.accent};
        }

        .sb-footer {
          padding: 1rem 1.25rem;
          border-top: 1px solid ${T.border};
          margin-top: auto;
        }

        .sb-role-badge {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 0.625rem 0.75rem;
          border-radius: 10px;
          background: ${T.surface};
          border: 1px solid ${T.border};
        }

        .sb-role-icon {
          width: 28px;
          height: 28px;
          border-radius: 7px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .sb-role-name {
          font-size: 13px;
          font-weight: 500;
          color: ${T.textPrimary};
          margin: 0;
          line-height: 1;
        }
        .sb-role-label {
          font-size: 11px;
          color: ${T.textMuted};
          margin: 2px 0 0;
        }
      `}</style>

      <div className="sb-root">
        {/* Logo — links to role-appropriate dashboard */}
        <Link to={isAdmin ? "/admin/dashboard" : "/dashboard"} className="sb-logo">
          <div className="sb-logo-icon">
            <Headphones size={17} strokeWidth={1.75} />
          </div>
          <div>
            <p className="sb-logo-text">Helpdesk</p>
            <p className="sb-logo-sub">Support System</p>
          </div>
        </Link>

        <p className="sb-section">Navigation</p>

        <nav className="sb-nav">
          {visibleItems.map(({ to, label, Icon }) => {
            // Exact match for dashboard routes, prefix match for everything else
            const active = pathname === to;
            return (
              <motion.div key={to} whileTap={{ scale: 0.98 }}>
                <Link to={to} className={`sb-link${active ? " active" : ""}`}>
                  <span className="sb-link-icon">
                    <Icon size={16} strokeWidth={1.75} />
                  </span>
                  {label}
                </Link>
              </motion.div>
            );
          })}
        </nav>

        {/* Role badge footer */}
        <div className="sb-footer">
          <div className="sb-role-badge">
            <div
              className="sb-role-icon"
              style={{
                background: isAdmin ? "rgba(91,156,246,0.12)" : T.accentDim,
                color:      isAdmin ? "#5B9CF6" : T.accent,
              }}
            >
              {isAdmin
                ? <ShieldCheck size={14} strokeWidth={1.75} />
                : <User        size={14} strokeWidth={1.75} />}
            </div>
            <div>
              <p className="sb-role-name">{user?.name ?? "Guest"}</p>
              <p className="sb-role-label">{isAdmin ? "Administrator" : "User"}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}