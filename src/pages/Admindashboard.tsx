import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Filter,
  Search,
  Settings,
  Ticket,
  TrendingUp,
  XCircle
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { NotificationController } from "../controllers/NotificationController";
import { TicketController } from "../controllers/TicketController";
import type { Priority, TicketStatus, Ticket as TicketType } from "../types";

// ─── Theme ────────────────────────────────────────────────────────────────────
const T = {
  bg:           "#0D0F14",
  surface:      "#13161D",
  surfaceHover: "#1A1E27",
  border:       "#252932",
  accent:       "#E8A838",
  accentDim:    "rgba(232,168,56,0.12)",
  accentGlow:   "rgba(232,168,56,0.22)",
  textPrimary:  "#F0EDE6",
  textSec:      "#7A8194",
  textMuted:    "#454B5C",
};

const STATUS_CFG: Record<TicketStatus, { label: string; color: string; dim: string; Icon: React.ElementType }> = {
  "open":        { label: "Open",        color: T.blue,    dim: T.blueDim,    Icon: Ticket       },
  "in-progress": { label: "In Progress", color: T.yellow,  dim: T.yellowDim,  Icon: Clock        },
  "resolved":    { label: "Resolved",    color: T.green,   dim: T.greenDim,   Icon: CheckCircle2 },
  "closed":      { label: "Closed",      color: T.textSec, dim: T.border,     Icon: XCircle      },
};

const PRIORITY_CFG: Record<Priority, { color: string; dim: string }> = {
  high:   { color: T.red,    dim: T.redDim    },
  medium: { color: T.yellow, dim: T.yellowDim },
  low:    { color: T.green,  dim: T.greenDim  },
};

// ─── Animations ───────────────────────────────────────────────────────────────
const stagger = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
};

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, color, colorDim, delay = 0 }:
  { label:string; value:number; icon:React.ElementType; color:string; colorDim:string; delay?:number }) {
  return (
    <motion.div
      style={{
        background: T.surface,
        border: `1px solid ${T.border}`,
        borderRadius: 16,
        padding: "1.25rem",
        position: "relative",
        overflow: "hidden",
        cursor: "default",
        transition: "border-color 0.2s, transform 0.2s",
        ["--c" as string]: color,
        ["--cd" as string]: colorDim,
      }}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1], delay }}
      whileHover={{ y: -3, transition: { duration: 0.18 } }}
    >
      <div style={{
        width: 36, height: 36, borderRadius: 9,
        background: colorDim, color,
        display: "flex", alignItems: "center", justifyContent: "center",
        marginBottom: "0.875rem",
      }}>
        <Icon size={17} strokeWidth={1.75} />
      </div>
      <p style={{ fontSize: 11.5, color: T.textSec, margin: "0 0 4px" }}>{label}</p>
      <p style={{
        fontFamily: "'Playfair Display', serif",
        fontSize: 30, fontWeight: 700,
        color: T.textPrimary, margin: 0, lineHeight: 1,
        letterSpacing: "-0.03em",
      }}>{value}</p>
      <div style={{
        position: "absolute", top: -18, right: -18,
        width: 64, height: 64, borderRadius: "50%",
        background: colorDim, pointerEvents: "none",
      }} />
    </motion.div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const { user }   = useAuth();
  const navigate   = useNavigate();

  const [tickets, setTickets]     = useState<TicketType[]>(() => TicketController.getAll());
  const [search, setSearch]       = useState("");
  const [filterStatus, setFilter] = useState<TicketStatus | "all">("all");
  const [sortField, setSortField] = useState<keyof TicketType>("createdAt");
  const [sortAsc, setSortAsc]     = useState(false);

  const reload = () => setTickets(TicketController.getAll());

  const handleSort = (field: keyof TicketType) => {
    if (sortField === field) setSortAsc((v) => !v);
    else { setSortField(field); setSortAsc(true); }
  };

  const handleStatusChange = (id: string, status: TicketStatus) => {
    const ticket = TicketController.getById(id);
    if (!ticket) return;
    TicketController.update({ ...ticket, status });
    // Notify the user who submitted the ticket
    NotificationController.add("user", {
      message:  `Your ticket ${ticket.id} status updated to "${STATUS_CFG[status].label}"`,
      ticketId: ticket.id,
    });
    reload();
  };

  const filtered = tickets
    .filter((t) => {
      const q = search.toLowerCase();
      return (
        (filterStatus === "all" || t.status === filterStatus) &&
        (
          t.id.toLowerCase().includes(q) ||
          t.subject.toLowerCase().includes(q) ||
          t.createdBy.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q)
        )
      );
    })
    .sort((a, b) => {
      const va = String(a[sortField] ?? "");
      const vb = String(b[sortField] ?? "");
      return sortAsc ? va.localeCompare(vb) : vb.localeCompare(va);
    });

  const SortIcon = ({ field }: { field: keyof TicketType }) =>
    sortField === field
      ? sortAsc ? <ChevronUp size={13} /> : <ChevronDown size={13} />
      : <ChevronDown size={13} style={{ opacity: 0.3 }} />;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@400;500&display=swap');

        .ad-root {
          padding: 2.5rem 2rem;
          font-family: 'DM Sans', sans-serif;
          color: ${T.textPrimary};
          box-sizing: border-box;
          max-width: 1060px;
        }

        .ad-top-row {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 1rem;
          margin-bottom: 2rem;
          flex-wrap: wrap;
        }

        .ad-h1 {
          font-family: 'Playfair Display', serif;
          font-size: 28px;
          font-weight: 700;
          color: ${T.textPrimary};
          margin: 0 0 0.25rem;
          letter-spacing: -0.022em;
        }
        .ad-sub { font-size: 13.5px; color: ${T.textSec}; margin: 0; }

        .ad-settings-btn {
          all: unset;
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 0.6rem 1.125rem;
          border-radius: 12px;
          border: 1px solid ${T.border};
          background: ${T.surface};
          color: ${T.textSec};
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          cursor: pointer;
          transition: border-color 0.17s, color 0.17s, background 0.17s;
          white-space: nowrap;
        }
        .ad-settings-btn:hover {
          border-color: ${T.accent};
          color: ${T.accent};
          background: ${T.accentDim};
        }

        .ad-stat-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
          gap: 1rem;
          margin-bottom: 2.5rem;
        }

        .ad-toolbar {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1rem;
          flex-wrap: wrap;
        }

        .ad-search-wrap {
          position: relative;
          flex: 1;
          min-width: 180px;
        }
        .ad-search-icon {
          position: absolute;
          left: 11px;
          top: 50%;
          transform: translateY(-50%);
          color: ${T.textMuted};
          pointer-events: none;
          display: flex;
        }
        .ad-search {
          all: unset;
          width: 100%;
          padding: 0.6rem 0.875rem 0.6rem 2.25rem;
          background: ${T.surface};
          border: 1px solid ${T.border};
          border-radius: 10px;
          font-family: 'DM Sans', sans-serif;
          font-size: 13.5px;
          color: ${T.textPrimary};
          box-sizing: border-box;
          transition: border-color 0.17s;
        }
        .ad-search::placeholder { color: ${T.textMuted}; }
        .ad-search:focus { border-color: ${T.accent}; }

        .ad-filter-btn {
          all: unset;
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 0.6rem 0.875rem;
          border-radius: 10px;
          border: 1px solid ${T.border};
          background: transparent;
          font-family: 'DM Sans', sans-serif;
          font-size: 12.5px;
          color: ${T.textSec};
          cursor: pointer;
          transition: all 0.15s;
          white-space: nowrap;
        }
        .ad-filter-btn:hover,
        .ad-filter-btn.active {
          border-color: ${T.accent};
          color: ${T.accent};
          background: ${T.accentDim};
        }

        .ad-table-wrap {
          background: ${T.surface};
          border: 1px solid ${T.border};
          border-radius: 16px;
          overflow: hidden;
        }

        .ad-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 13.5px;
        }

        .ad-table thead tr {
          border-bottom: 1px solid ${T.border};
        }

        .ad-th {
          padding: 0.75rem 1rem;
          text-align: left;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: ${T.textMuted};
          cursor: pointer;
          user-select: none;
          white-space: nowrap;
        }
        .ad-th:hover { color: ${T.textSec}; }
        .ad-th-inner { display: flex; align-items: center; gap: 4px; }

        .ad-td {
          padding: 0.875rem 1rem;
          border-bottom: 1px solid ${T.border};
          vertical-align: middle;
        }
        .ad-table tbody tr:last-child .ad-td { border-bottom: none; }
        .ad-table tbody tr { transition: background 0.15s; }
        .ad-table tbody tr:hover { background: ${T.surfaceHover}; }

        .ad-ticket-id {
          font-size: 11.5px;
          color: ${T.textMuted};
          font-weight: 500;
          letter-spacing: 0.02em;
        }

        .ad-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 3px 9px;
          border-radius: 20px;
          font-size: 11.5px;
          font-weight: 500;
          white-space: nowrap;
        }

        .ad-status-select {
          all: unset;
          font-family: 'DM Sans', sans-serif;
          font-size: 11.5px;
          font-weight: 500;
          padding: 3px 22px 3px 9px;
          border-radius: 20px;
          cursor: pointer;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%237A8194' stroke-width='2.5'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 6px center;
          appearance: none;
        }

        .ad-empty-row td {
          text-align: center;
          padding: 3rem;
          color: ${T.textMuted};
          font-size: 13.5px;
        }

        .ad-section-label {
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: ${T.textMuted};
          margin: 0 0 1rem;
        }

        @keyframes ad-ping {
          0%   { transform: scale(1);   opacity: 0.8; }
          70%  { transform: scale(2.2); opacity: 0;   }
          100% { transform: scale(2.2); opacity: 0;   }
        }
        .ad-pulse {
          width: 8px; height: 8px; border-radius: 50%;
          background: ${T.green}; position: relative; flex-shrink: 0;
        }
        .ad-pulse::after {
          content: ''; position: absolute; inset: 0;
          border-radius: 50%; background: ${T.green};
          animation: ad-ping 2s ease-out infinite;
        }
        .ad-status-bar {
          display: flex; align-items: center; gap: 7px;
          font-size: 12px; color: ${T.textSec};
          padding-top: 1.5rem; margin-top: 2rem;
          border-top: 1px solid ${T.border};
        }
      `}</style>

      <div className="ad-root">
        <motion.div variants={stagger} initial="hidden" animate="show">

          {/* Top row */}
          <motion.div className="ad-top-row" variants={fadeUp}>
            <div>
              <h1 className="ad-h1">Admin Dashboard</h1>
              <p className="ad-sub">
                Welcome back, <strong style={{ color: T.textPrimary, fontWeight: 500 }}>{user?.name ?? "Admin"}</strong>.
                Here's your system overview.
              </p>
            </div>
            <motion.button
              className="ad-settings-btn"
              onClick={() => navigate("/settings")}
              whileTap={{ scale: 0.97 }}
            >
              <Settings size={15} strokeWidth={1.75} />
              System Settings
              <ArrowRight size={13} strokeWidth={2} />
            </motion.button>
          </motion.div>

          {/* Stats — all derived from live localStorage data */}
          <motion.p className="ad-section-label" variants={fadeUp}>Overview</motion.p>
          <div className="ad-stat-grid">
            <StatCard label="Total Tickets"     value={tickets.length}                                                              icon={Ticket}      color={T.accent} colorDim={T.accentDim} delay={0.1}  />
            <StatCard label="Open"              value={tickets.filter(t => t.status === "open").length}                             icon={TrendingUp}  color={T.blue}   colorDim={T.blueDim}   delay={0.17} />
            <StatCard label="In Progress"       value={tickets.filter(t => t.status === "in-progress").length}                      icon={Clock}       color={T.yellow} colorDim={T.yellowDim} delay={0.24} />
            <StatCard label="Resolved / Closed" value={tickets.filter(t => t.status === "resolved" || t.status === "closed").length} icon={CheckCircle2}color={T.green}  colorDim={T.greenDim}  delay={0.31} />
          </div>

          {/* Ticket table */}
          <motion.p className="ad-section-label" variants={fadeUp}>Ticket Management</motion.p>

          <motion.div variants={fadeUp}>
            <div className="ad-toolbar">
              <div className="ad-search-wrap">
                <span className="ad-search-icon"><Search size={14} strokeWidth={1.75} /></span>
                <input
                  className="ad-search"
                  placeholder="Search tickets, users…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <Filter size={14} strokeWidth={1.75} style={{ color: T.textMuted, flexShrink: 0 }} />

              {(["all","open","in-progress","resolved","closed"] as const).map((s) => (
                <button
                  key={s}
                  className={`ad-filter-btn${filterStatus === s ? " active" : ""}`}
                  onClick={() => setFilter(s)}
                >
                  {s === "all" ? "All" : STATUS_CFG[s].label}
                </button>
              ))}
            </div>

            <div className="ad-table-wrap">
              <table className="ad-table">
                <thead>
                  <tr>
                    {([
                      { key: "id",        label: "ID"           },
                      { key: "subject",   label: "Subject"      },
                      { key: "createdBy", label: "Submitted By" },
                      { key: "category",  label: "Category"     },
                      { key: "priority",  label: "Priority"     },
                      { key: "status",    label: "Status"       },
                      { key: "createdAt", label: "Date"         },
                    ] as { key: keyof TicketType; label: string }[]).map(({ key, label }) => (
                      <th key={key} className="ad-th" onClick={() => handleSort(key)}>
                        <span className="ad-th-inner">
                          {label} <SortIcon field={key} />
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {filtered.length === 0 ? (
                      <tr className="ad-empty-row">
                        <td colSpan={7}>
                          {tickets.length === 0 ? "No tickets submitted yet." : "No tickets match your search."}
                        </td>
                      </tr>
                    ) : (
                      filtered.map((t) => {
                        const sCfg = STATUS_CFG[t.status];
                        const pCfg = PRIORITY_CFG[t.priority];
                        const date = new Date(t.createdAt).toLocaleDateString("en-US", {
                          month: "short", day: "numeric", year: "numeric",
                        });
                        return (
                          <motion.tr
                            key={t.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <td className="ad-td"><span className="ad-ticket-id">{t.id}</span></td>
                            <td className="ad-td" style={{ maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.subject}</td>
                            <td className="ad-td" style={{ color: T.textSec, whiteSpace: "nowrap" }}>{t.createdBy}</td>
                            <td className="ad-td" style={{ color: T.textSec, whiteSpace: "nowrap" }}>{t.category}</td>
                            <td className="ad-td">
                              <span className="ad-badge" style={{ background: pCfg.dim, color: pCfg.color }}>
                                {t.priority}
                              </span>
                            </td>
                            <td className="ad-td">
                              <select
                                className="ad-status-select ad-badge"
                                value={t.status}
                                style={{ background: sCfg.dim, color: sCfg.color }}
                                onChange={(e) => handleStatusChange(t.id, e.target.value as TicketStatus)}
                              >
                                {(Object.keys(STATUS_CFG) as TicketStatus[]).map((s) => (
                                  <option key={s} value={s}>{STATUS_CFG[s].label}</option>
                                ))}
                              </select>
                            </td>
                            <td className="ad-td" style={{ color: T.textMuted, whiteSpace: "nowrap", fontSize: 12 }}>{date}</td>
                          </motion.tr>
                        );
                      })
                    )}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Status bar */}
          <motion.div className="ad-status-bar" variants={fadeUp}>
            <div className="ad-pulse" />
            <Clock size={13} strokeWidth={1.75} />
            {filtered.length} of {tickets.length} tickets shown &nbsp;·&nbsp; All systems operational
          </motion.div>

        </motion.div>
      </div>
    </>
  );
}