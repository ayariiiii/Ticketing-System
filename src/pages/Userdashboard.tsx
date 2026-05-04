import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCircle2,
  ChevronDown,
  Clock,
  Inbox,
  PlusCircle,
  Send,
  Ticket,
  XCircle
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { NotificationController } from "../controllers/NotificationController";
import { TicketController } from "../controllers/TicketController";
import type { Priority, TicketStatus } from "../types";

// ─── Theme ────────────────────────────────────────────────────────────────────

const CATEGORIES = ["IT Support", "Hardware", "Network", "Software", "HR", "Other"] as const;
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

// ─── Status config ────────────────────────────────────────────────────────────
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

// ─── Component ────────────────────────────────────────────────────────────────
export default function UserDashboard() {
  const { user } = useAuth();

  // Load from localStorage on mount, re-render when tickets change
  const [tickets, setTickets] = useState(() => TicketController.getAll());

  const [showForm, setShowForm]           = useState(false);
  const [subject, setSubject]             = useState("");
  const [category, setCategory]           = useState<typeof CATEGORIES[number]>(CATEGORIES[0]);
  const [priority, setPriority]           = useState<Priority>("medium");
  const [description, setDescription]     = useState("");
  const [submitting, setSubmitting]       = useState(false);
  const [successMsg, setSuccessMsg]       = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim()) return;

    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 700));

    const newTicket = {
      id:          TicketController.nextId(),
      subject:     subject.trim(),
      description: description.trim(),
      category,
      priority,
      status:      "open" as TicketStatus,
      assignedTo:  null,
      notes:       [],
      createdBy:   user?.name ?? "User",
      createdAt:   new Date().toISOString(),
    };

    TicketController.create(newTicket);

    // Notify admin of new ticket
    NotificationController.add("admin", {
      message:  `New ticket submitted: ${newTicket.subject}`,
      ticketId: newTicket.id,
    });

    // If high priority, add a separate alert for admin
    if (newTicket.priority === "high") {
      NotificationController.add("admin", {
        message:  `High priority ticket submitted: ${newTicket.subject}`,
        ticketId: newTicket.id,
      });
    }

    // Reload from localStorage so the list is in sync
    setTickets(TicketController.getAll());

    setSubject("");
    setCategory(CATEGORIES[0]);
    setPriority("medium");
    setDescription("");
    setSubmitting(false);
    setShowForm(false);
    setSuccessMsg(`Ticket ${newTicket.id} submitted successfully.`);
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@400;500&display=swap');

        .ud-root {
          padding: 2.5rem 2rem;
          font-family: 'DM Sans', sans-serif;
          color: ${T.textPrimary};
          box-sizing: border-box;
          max-width: 860px;
        }

        .ud-h1 {
          font-family: 'Playfair Display', serif;
          font-size: 28px;
          font-weight: 700;
          color: ${T.textPrimary};
          margin: 0 0 0.3rem;
          letter-spacing: -0.022em;
        }
        .ud-sub { font-size: 13.5px; color: ${T.textSec}; margin: 0 0 2rem; }

        .ud-stats { display: flex; gap: 0.875rem; margin-bottom: 2rem; flex-wrap: wrap; }
        .ud-stat {
          background: ${T.surface};
          border: 1px solid ${T.border};
          border-radius: 13px;
          padding: 0.875rem 1.125rem;
          display: flex;
          align-items: center;
          gap: 0.625rem;
          font-size: 13px;
          color: ${T.textSec};
          min-width: 130px;
        }
        .ud-stat strong { color: ${T.textPrimary}; font-size: 18px; font-weight: 500; }

        .ud-section-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1rem;
        }
        .ud-section-label {
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: ${T.textMuted};
          margin: 0;
        }

        .ud-submit-btn {
          all: unset;
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 0.5rem 1rem;
          border-radius: 10px;
          background: ${T.accent};
          color: #0D0F14;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: filter 0.17s;
        }
        .ud-submit-btn:hover { filter: brightness(1.08); }

        .ud-form-card {
          background: ${T.surface};
          border: 1px solid ${T.border};
          border-radius: 16px;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
          overflow: hidden;
        }

        .ud-form-title {
          font-size: 15px;
          font-weight: 500;
          color: ${T.textPrimary};
          margin: 0 0 1.25rem;
          display: flex;
          align-items: center;
          gap: 7px;
        }

        .ud-field { display: flex; flex-direction: column; gap: 0.35rem; margin-bottom: 1rem; }
        .ud-label { font-size: 12px; font-weight: 500; color: ${T.textSec}; }

        .ud-input, .ud-select, .ud-textarea {
          all: unset;
          width: 100%;
          padding: 0.7rem 0.875rem;
          background: ${T.bg};
          border: 1px solid ${T.border};
          border-radius: 10px;
          font-family: 'DM Sans', sans-serif;
          font-size: 13.5px;
          color: ${T.textPrimary};
          box-sizing: border-box;
          transition: border-color 0.17s;
        }
        .ud-input::placeholder, .ud-textarea::placeholder { color: ${T.textMuted}; }
        .ud-input:focus, .ud-select:focus, .ud-textarea:focus { border-color: ${T.accent}; }
        .ud-textarea { resize: vertical; min-height: 80px; line-height: 1.5; }

        .ud-select-wrap { position: relative; }
        .ud-select-wrap svg {
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          pointer-events: none;
          color: ${T.textMuted};
        }

        .ud-form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 0.875rem; }

        .ud-priority-row { display: flex; gap: 0.5rem; }
        .ud-priority-btn {
          all: unset;
          padding: 0.4rem 0.875rem;
          border-radius: 8px;
          font-size: 12.5px;
          font-weight: 500;
          cursor: pointer;
          border: 1px solid ${T.border};
          color: ${T.textSec};
          background: transparent;
          transition: all 0.15s;
        }

        .ud-form-actions {
          display: flex;
          gap: 0.625rem;
          justify-content: flex-end;
          margin-top: 1.25rem;
          padding-top: 1.125rem;
          border-top: 1px solid ${T.border};
        }
        .ud-cancel-btn {
          all: unset;
          padding: 0.6rem 1.125rem;
          border-radius: 10px;
          border: 1px solid ${T.border};
          font-family: 'DM Sans', sans-serif;
          font-size: 13.5px;
          color: ${T.textSec};
          cursor: pointer;
          transition: background 0.15s;
        }
        .ud-cancel-btn:hover { background: ${T.surfaceHover}; }

        .ud-form-submit {
          all: unset;
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 0.6rem 1.25rem;
          border-radius: 10px;
          background: ${T.accent};
          color: #0D0F14;
          font-family: 'DM Sans', sans-serif;
          font-size: 13.5px;
          font-weight: 500;
          cursor: pointer;
          transition: filter 0.15s;
        }
        .ud-form-submit:hover:not(:disabled) { filter: brightness(1.08); }
        .ud-form-submit:disabled { opacity: 0.55; cursor: not-allowed; }

        @keyframes ud-spin { to { transform: rotate(360deg); } }
        .ud-spinner {
          width: 14px; height: 14px;
          border: 2px solid rgba(13,15,20,0.25);
          border-top-color: #0D0F14;
          border-radius: 50%;
          animation: ud-spin 0.7s linear infinite;
        }

        .ud-toast {
          display: flex;
          align-items: center;
          gap: 8px;
          background: ${T.greenDim};
          border: 1px solid rgba(61,214,140,0.25);
          color: ${T.green};
          border-radius: 11px;
          padding: 0.75rem 1rem;
          font-size: 13px;
          margin-bottom: 1.25rem;
        }

        .ud-ticket-list { display: flex; flex-direction: column; gap: 0.625rem; }

        .ud-ticket-row {
          background: ${T.surface};
          border: 1px solid ${T.border};
          border-radius: 14px;
          padding: 1rem 1.125rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          transition: border-color 0.17s, background 0.17s;
          cursor: default;
        }
        .ud-ticket-row:hover { background: ${T.surfaceHover}; }

        .ud-ticket-id {
          font-size: 11.5px;
          font-weight: 500;
          color: ${T.textMuted};
          min-width: 58px;
          letter-spacing: 0.02em;
        }

        .ud-ticket-subject {
          flex: 1;
          font-size: 14px;
          color: ${T.textPrimary};
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .ud-ticket-cat {
          font-size: 11.5px;
          color: ${T.textMuted};
          white-space: nowrap;
        }

        .ud-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 3px 9px;
          border-radius: 20px;
          font-size: 11.5px;
          font-weight: 500;
          white-space: nowrap;
        }

        .ud-ticket-date {
          font-size: 11.5px;
          color: ${T.textMuted};
          white-space: nowrap;
        }

        .ud-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 3rem 1rem;
          color: ${T.textMuted};
          gap: 0.625rem;
          background: ${T.surface};
          border: 1px solid ${T.border};
          border-radius: 16px;
        }
        .ud-empty p { margin: 0; font-size: 13.5px; }
      `}</style>

      <div className="ud-root">
        <motion.div variants={stagger} initial="hidden" animate="show">

          {/* Header */}
          <motion.div variants={fadeUp}>
            <h1 className="ud-h1">My Dashboard</h1>
            <p className="ud-sub">Manage and track your support requests.</p>
          </motion.div>

          {/* Quick stats */}
          <motion.div className="ud-stats" variants={fadeUp}>
            {(["open","in-progress","resolved","closed"] as TicketStatus[]).map((s) => {
              const count = tickets.filter((t) => t.status === s).length;
              const cfg   = STATUS_CFG[s];
              return (
                <div className="ud-stat" key={s}>
                  <cfg.Icon size={15} strokeWidth={1.75} style={{ color: cfg.color, flexShrink: 0 }} />
                  <div>
                    <strong style={{ color: cfg.color }}>{count}</strong>
                    <span style={{ marginLeft: 5 }}>{cfg.label}</span>
                  </div>
                </div>
              );
            })}
          </motion.div>

          {/* Section header */}
          <motion.div className="ud-section-head" variants={fadeUp}>
            <p className="ud-section-label">My Tickets ({tickets.length})</p>
            <motion.button
              className="ud-submit-btn"
              onClick={() => setShowForm((v) => !v)}
              whileTap={{ scale: 0.97 }}
            >
              <PlusCircle size={14} strokeWidth={2} />
              {showForm ? "Cancel" : "New Ticket"}
            </motion.button>
          </motion.div>

          {/* Success toast */}
          <AnimatePresence>
            {successMsg && (
              <motion.div
                className="ud-toast"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <CheckCircle2 size={15} strokeWidth={2} />
                {successMsg}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit form */}
          <AnimatePresence>
            {showForm && (
              <motion.div
                key="form"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="ud-form-card">
                  <p className="ud-form-title">
                    <Ticket size={16} strokeWidth={1.75} style={{ color: T.accent }} />
                    Submit a New Ticket
                  </p>

                  <form onSubmit={handleSubmit}>
                    <div className="ud-field">
                      <label className="ud-label">Subject</label>
                      <input
                        className="ud-input"
                        placeholder="Brief description of your issue"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        required
                      />
                    </div>

                    <div className="ud-form-row">
                      <div className="ud-field">
                        <label className="ud-label">Category</label>
                        <div className="ud-select-wrap">
                          <select
                            className="ud-select"
                            value={category}
                            onChange={(e) => setCategory(e.target.value as typeof CATEGORIES[number])}
                          >
                            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                          </select>
                          <ChevronDown size={14} strokeWidth={2} />
                        </div>
                      </div>

                      <div className="ud-field">
                        <label className="ud-label">Priority</label>
                        <div className="ud-priority-row">
                          {(["low","medium","high"] as Priority[]).map((p) => {
                            const cfg    = PRIORITY_CFG[p];
                            const active = priority === p;
                            return (
                              <button
                                key={p}
                                type="button"
                                className="ud-priority-btn"
                                style={active ? { background: cfg.dim, borderColor: cfg.color, color: cfg.color } : {}}
                                onClick={() => setPriority(p)}
                              >
                                {p.charAt(0).toUpperCase() + p.slice(1)}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="ud-field">
                      <label className="ud-label">Description (optional)</label>
                      <textarea
                        className="ud-textarea"
                        placeholder="Provide additional context about your issue…"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                      />
                    </div>

                    <div className="ud-form-actions">
                      <button type="button" className="ud-cancel-btn" onClick={() => setShowForm(false)}>
                        Cancel
                      </button>
                      <button className="ud-form-submit" type="submit" disabled={submitting}>
                        {submitting
                          ? <><div className="ud-spinner" />Submitting…</>
                          : <><Send size={14} strokeWidth={2} />Submit Ticket</>}
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Ticket list */}
          <motion.div variants={fadeUp}>
            {tickets.length === 0 ? (
              <div className="ud-empty">
                <Inbox size={32} strokeWidth={1.25} />
                <p>No tickets yet. Submit one above.</p>
              </div>
            ) : (
              <div className="ud-ticket-list">
                <AnimatePresence initial={false}>
                  {tickets.map((t, i) => {
                    const sCfg = STATUS_CFG[t.status];
                    const pCfg = PRIORITY_CFG[t.priority];
                    const date = new Date(t.createdAt).toLocaleDateString("en-US", {
                      month: "short", day: "numeric", year: "numeric"
                    });
                    return (
                      <motion.div
                        key={t.id}
                        className="ud-ticket-row"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                      >
                        <span className="ud-ticket-id">{t.id}</span>
                        <span className="ud-ticket-subject">{t.subject}</span>
                        <span className="ud-ticket-cat">{t.category}</span>
                        <span className="ud-badge" style={{ background: pCfg.dim, color: pCfg.color }}>
                          {t.priority}
                        </span>
                        <span className="ud-badge" style={{ background: sCfg.dim, color: sCfg.color }}>
                          <sCfg.Icon size={11} strokeWidth={2} />
                          {sCfg.label}
                        </span>
                        <span className="ud-ticket-date">{date}</span>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </motion.div>

        </motion.div>
      </div>
    </>
  );
}