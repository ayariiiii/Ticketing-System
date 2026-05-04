import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Filter,
  MessageSquarePlus,
  PlusCircle,
  Search,
  StickyNote,
  Ticket,
  Trash2,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { useAuth } from "../context/AuthContext";
import { NotificationController } from "../controllers/NotificationController";
import { TicketController } from "../controllers/TicketController";
import type { Department, Priority, TicketStatus, Ticket as TicketType } from "../types";

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
// ─── Constants ────────────────────────────────────────────────────────────────
const DEPARTMENTS: Department[] = ["IT Support", "Hardware", "Network", "Software", "HR", "Other"];

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
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.08 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
};

// ─── Subcomponent: Notes panel ────────────────────────────────────────────────
function NotesPanel({ ticket, onUpdate }: { ticket: TicketType; onUpdate: () => void }) {
  const { user }        = useAuth();
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);

  const handleAdd = async () => {
    if (!text.trim()) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 400));
    TicketController.addNote(ticket.id, {
      id:        uuidv4(),
      content:   text.trim(),
      createdAt: new Date().toISOString(),
      createdBy: user?.name ?? "Admin",
    });
    setText("");
    setSaving(false);
    onUpdate();
  };

  return (
    <div className="tk-notes-panel">
      <p className="tk-notes-title">
        <StickyNote size={13} strokeWidth={1.75} />
        Notes ({ticket.notes.length})
      </p>

      {ticket.notes.length > 0 && (
        <div className="tk-notes-list">
          {ticket.notes.map((n) => (
            <div key={n.id} className="tk-note-item">
              <p className="tk-note-meta">
                {n.createdBy} &middot;{" "}
                {new Date(n.createdAt).toLocaleDateString("en-US", {
                  month: "short", day: "numeric", year: "numeric",
                })}
              </p>
              <p className="tk-note-content">{n.content}</p>
            </div>
          ))}
        </div>
      )}

      <div className="tk-note-input-row">
        <input
          className="tk-note-input"
          placeholder="Add a note…"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") handleAdd(); }}
        />
        <button
          className="tk-note-add-btn"
          onClick={handleAdd}
          disabled={saving || !text.trim()}
        >
          {saving ? <div className="tk-spinner-sm" /> : <MessageSquarePlus size={14} strokeWidth={2} />}
        </button>
      </div>
    </div>
  );
}

// ─── Subcomponent: Ticket row ─────────────────────────────────────────────────
function TicketRow({
  ticket,
  onUpdate,
  onDelete,
}: {
  ticket:   TicketType;
  onUpdate: () => void;
  onDelete: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  const sCfg = STATUS_CFG[ticket.status];
  const pCfg = PRIORITY_CFG[ticket.priority];

  const handleStatusChange = (status: TicketStatus) => {
    TicketController.update({ ...ticket, status });
    // Notify the user who submitted the ticket
    NotificationController.add("user", {
      message:  `Your ticket ${ticket.id} status updated to "${STATUS_CFG[status].label}"`,
      ticketId: ticket.id,
    });
    onUpdate();
  };

  const handleAssignChange = (dept: string) => {
    TicketController.update({ ...ticket, assignedTo: dept as Department });
    onUpdate();
  };

  const date = new Date(ticket.createdAt).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });

  return (
    <>
      <motion.tr
        className="tk-tr"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        {/* ID */}
        <td className="tk-td">
          <span className="tk-ticket-id">{ticket.id}</span>
        </td>

        {/* Subject + description toggle */}
        <td className="tk-td tk-td-subject">
          <button
            className="tk-expand-btn"
            onClick={() => setExpanded((v) => !v)}
            title={expanded ? "Collapse" : "Expand"}
          >
            {expanded
              ? <ChevronUp size={13} strokeWidth={2} />
              : <ChevronDown size={13} strokeWidth={2} />}
          </button>
          <span className="tk-subject-text">{ticket.subject}</span>
        </td>

        {/* Submitted by */}
        <td className="tk-td tk-muted">{ticket.createdBy}</td>

        {/* Category */}
        <td className="tk-td tk-muted">{ticket.category}</td>

        {/* Priority */}
        <td className="tk-td">
          <span className="tk-badge" style={{ background: pCfg.dim, color: pCfg.color }}>
            {ticket.priority}
          </span>
        </td>

        {/* Status — inline select */}
        <td className="tk-td">
          <select
            className="tk-status-select tk-badge"
            value={ticket.status}
            style={{ background: sCfg.dim, color: sCfg.color }}
            onChange={(e) => handleStatusChange(e.target.value as TicketStatus)}
          >
            {(Object.keys(STATUS_CFG) as TicketStatus[]).map((s) => (
              <option key={s} value={s}>{STATUS_CFG[s].label}</option>
            ))}
          </select>
        </td>

        {/* Assign to department */}
        <td className="tk-td">
          <select
            className="tk-assign-select"
            value={ticket.assignedTo ?? ""}
            onChange={(e) => handleAssignChange(e.target.value)}
          >
            <option value="">Unassigned</option>
            {DEPARTMENTS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </td>

        {/* Date */}
        <td className="tk-td tk-date">{date}</td>

        {/* Delete */}
        <td className="tk-td">
          <button
            className="tk-delete-btn"
            onClick={() => onDelete(ticket.id)}
            title="Delete ticket"
          >
            <Trash2 size={14} strokeWidth={1.75} />
          </button>
        </td>
      </motion.tr>

      {/* Expanded row — description + notes */}
      {expanded && (
        <tr className="tk-expanded-row">
          <td colSpan={9}>
            <div className="tk-expanded-content">
              {ticket.description && (
                <div className="tk-description-block">
                  <p className="tk-desc-label">Description</p>
                  <p className="tk-desc-text">{ticket.description}</p>
                </div>
              )}
              <NotesPanel ticket={ticket} onUpdate={onUpdate} />
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function Tickets() {
  const { user } = useAuth();

  const [tickets, setTickets]     = useState<TicketType[]>(() => TicketController.getAll());
  const [search, setSearch]       = useState("");
  const [filterStatus, setFilter] = useState<TicketStatus | "all">("all");
  const [sortField, setSortField] = useState<keyof TicketType>("createdAt");
  const [sortAsc, setSortAsc]     = useState(false);
  const [showForm, setShowForm]   = useState(false);

  // ── Create form state ──
  const [fSubject, setFSubject]           = useState("");
  const [fDescription, setFDescription]   = useState("");
  const [fCategory, setFCategory]         = useState<Department>(DEPARTMENTS[0]);
  const [fPriority, setFPriority]         = useState<Priority>("medium");
  const [fAssignedTo, setFAssignedTo]     = useState<Department | "">(""); 
  const [creating, setCreating]           = useState(false);

  // ── Confirm delete state ──
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const reload = () => setTickets(TicketController.getAll());

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fSubject.trim()) return;
    setCreating(true);
    await new Promise((r) => setTimeout(r, 500));

    TicketController.create({
      id:          TicketController.nextId(),
      subject:     fSubject.trim(),
      description: fDescription.trim(),
      category:    fCategory,
      priority:    fPriority,
      status:      "open",
      assignedTo:  fAssignedTo || null,
      notes:       [],
      createdBy:   user?.name ?? "Admin",
      createdAt:   new Date().toISOString(),
    });

    setFSubject(""); setFDescription(""); setFCategory(DEPARTMENTS[0]);
    setFPriority("medium"); setFAssignedTo("");
    setCreating(false);
    setShowForm(false);
    reload();
  };

  const handleDelete = (id: string) => setDeleteId(id);

  const confirmDelete = () => {
    if (!deleteId) return;
    TicketController.delete(deleteId);
    setDeleteId(null);
    reload();
  };

  const handleSort = (field: keyof TicketType) => {
    if (sortField === field) setSortAsc((v) => !v);
    else { setSortField(field); setSortAsc(true); }
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
      ? sortAsc ? <ChevronUp size={12} /> : <ChevronDown size={12} />
      : <ChevronDown size={12} style={{ opacity: 0.3 }} />;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@400;500&display=swap');

        .tk-root {
          padding: 2.5rem 2rem;
          font-family: 'DM Sans', sans-serif;
          color: ${T.textPrimary};
          box-sizing: border-box;
          max-width: 1100px;
        }

        .tk-top-row {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 1rem;
          margin-bottom: 2rem;
          flex-wrap: wrap;
        }

        .tk-h1 {
          font-family: 'Playfair Display', serif;
          font-size: 28px;
          font-weight: 700;
          color: ${T.textPrimary};
          margin: 0 0 0.25rem;
          letter-spacing: -0.022em;
        }
        .tk-sub { font-size: 13.5px; color: ${T.textSec}; margin: 0; }

        .tk-create-btn {
          all: unset;
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 0.6rem 1.125rem;
          border-radius: 12px;
          background: ${T.accent};
          color: #0D0F14;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          white-space: nowrap;
          transition: filter 0.17s;
        }
        .tk-create-btn:hover { filter: brightness(1.08); }

        /* ── Create form card ── */
        .tk-form-card {
          background: ${T.surface};
          border: 1px solid ${T.border};
          border-radius: 16px;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
          overflow: hidden;
        }
        .tk-form-title {
          font-size: 15px;
          font-weight: 500;
          color: ${T.textPrimary};
          margin: 0 0 1.25rem;
          display: flex;
          align-items: center;
          gap: 7px;
        }
        .tk-form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.875rem;
        }
        .tk-form-full { grid-column: 1 / -1; }
        .tk-field { display: flex; flex-direction: column; gap: 0.35rem; }
        .tk-label { font-size: 12px; font-weight: 500; color: ${T.textSec}; }

        .tk-input, .tk-select, .tk-textarea {
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
        .tk-input::placeholder, .tk-textarea::placeholder { color: ${T.textMuted}; }
        .tk-input:focus, .tk-select:focus, .tk-textarea:focus { border-color: ${T.accent}; }
        .tk-textarea { resize: vertical; min-height: 72px; line-height: 1.5; }

        .tk-priority-row { display: flex; gap: 0.5rem; flex-wrap: wrap; }
        .tk-priority-btn {
          all: unset;
          padding: 0.4rem 0.875rem;
          border-radius: 8px;
          font-size: 12.5px;
          font-weight: 500;
          cursor: pointer;
          border: 1px solid ${T.border};
          color: ${T.textSec};
          transition: all 0.15s;
        }

        .tk-form-actions {
          display: flex;
          gap: 0.625rem;
          justify-content: flex-end;
          margin-top: 1.25rem;
          padding-top: 1.125rem;
          border-top: 1px solid ${T.border};
        }
        .tk-cancel-btn {
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
        .tk-cancel-btn:hover { background: ${T.surfaceHover}; }
        .tk-submit-btn {
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
        .tk-submit-btn:hover:not(:disabled) { filter: brightness(1.08); }
        .tk-submit-btn:disabled { opacity: 0.55; cursor: not-allowed; }

        /* ── Toolbar ── */
        .tk-toolbar {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1rem;
          flex-wrap: wrap;
        }
        .tk-search-wrap {
          position: relative;
          flex: 1;
          min-width: 180px;
        }
        .tk-search-icon {
          position: absolute;
          left: 11px;
          top: 50%;
          transform: translateY(-50%);
          color: ${T.textMuted};
          pointer-events: none;
          display: flex;
        }
        .tk-search {
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
        .tk-search::placeholder { color: ${T.textMuted}; }
        .tk-search:focus { border-color: ${T.accent}; }

        .tk-filter-btn {
          all: unset;
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 0.6rem 0.875rem;
          border-radius: 10px;
          border: 1px solid ${T.border};
          font-family: 'DM Sans', sans-serif;
          font-size: 12.5px;
          color: ${T.textSec};
          cursor: pointer;
          transition: all 0.15s;
          white-space: nowrap;
        }
        .tk-filter-btn:hover, .tk-filter-btn.active {
          border-color: ${T.accent};
          color: ${T.accent};
          background: ${T.accentDim};
        }

        /* ── Table ── */
        .tk-table-wrap {
          background: ${T.surface};
          border: 1px solid ${T.border};
          border-radius: 16px;
          overflow: hidden;
        }
        .tk-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 13.5px;
        }
        .tk-table thead tr { border-bottom: 1px solid ${T.border}; }
        .tk-th {
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
        .tk-th:hover { color: ${T.textSec}; }
        .tk-th-inner { display: flex; align-items: center; gap: 4px; }

        .tk-td {
          padding: 0.875rem 1rem;
          border-bottom: 1px solid ${T.border};
          vertical-align: middle;
        }
        .tk-table tbody tr:last-child .tk-td { border-bottom: none; }
        .tk-tr { transition: background 0.15s; }
        .tk-tr:hover { background: ${T.surfaceHover}; }
        .tk-muted { color: ${T.textSec}; white-space: nowrap; }
        .tk-date { color: ${T.textMuted}; font-size: 12px; white-space: nowrap; }

        .tk-ticket-id {
          font-size: 11.5px;
          color: ${T.textMuted};
          font-weight: 500;
          letter-spacing: 0.02em;
        }

        .tk-td-subject {
          display: flex;
          align-items: center;
          gap: 7px;
          max-width: 220px;
        }

        .tk-expand-btn {
          all: unset;
          cursor: pointer;
          color: ${T.textMuted};
          display: flex;
          align-items: center;
          flex-shrink: 0;
          transition: color 0.15s;
        }
        .tk-expand-btn:hover { color: ${T.accent}; }

        .tk-subject-text {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .tk-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 3px 9px;
          border-radius: 20px;
          font-size: 11.5px;
          font-weight: 500;
          white-space: nowrap;
        }

        .tk-status-select {
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

        .tk-assign-select {
          all: unset;
          font-family: 'DM Sans', sans-serif;
          font-size: 12px;
          color: ${T.textSec};
          padding: 3px 20px 3px 0;
          cursor: pointer;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%237A8194' stroke-width='2.5'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 2px center;
          appearance: none;
          white-space: nowrap;
        }
        .tk-assign-select:focus { outline: none; }

        .tk-delete-btn {
          all: unset;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          border-radius: 7px;
          color: ${T.textMuted};
          cursor: pointer;
          transition: background 0.15s, color 0.15s;
        }
        .tk-delete-btn:hover {
          background: ${T.redDim};
          color: ${T.red};
        }

        /* ── Expanded row ── */
        .tk-expanded-row { background: ${T.bg}; }
        .tk-expanded-content {
          padding: 1rem 1.25rem 1.25rem 3rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .tk-description-block {
          padding: 0.875rem 1rem;
          background: ${T.surface};
          border: 1px solid ${T.border};
          border-radius: 10px;
        }
        .tk-desc-label {
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: ${T.textMuted};
          margin: 0 0 0.5rem;
        }
        .tk-desc-text {
          font-size: 13.5px;
          color: ${T.textSec};
          margin: 0;
          line-height: 1.6;
        }

        /* ── Notes panel ── */
        .tk-notes-panel {
          background: ${T.surface};
          border: 1px solid ${T.border};
          border-radius: 10px;
          padding: 0.875rem 1rem;
        }
        .tk-notes-title {
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: ${T.textMuted};
          margin: 0 0 0.75rem;
          display: flex;
          align-items: center;
          gap: 5px;
        }
        .tk-notes-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-bottom: 0.75rem;
        }
        .tk-note-item {
          background: ${T.bg};
          border: 1px solid ${T.border};
          border-radius: 8px;
          padding: 0.625rem 0.75rem;
        }
        .tk-note-meta {
          font-size: 11px;
          color: ${T.textMuted};
          margin: 0 0 4px;
        }
        .tk-note-content {
          font-size: 13px;
          color: ${T.textSec};
          margin: 0;
          line-height: 1.5;
        }
        .tk-note-input-row {
          display: flex;
          gap: 0.5rem;
        }
        .tk-note-input {
          all: unset;
          flex: 1;
          padding: 0.55rem 0.75rem;
          background: ${T.bg};
          border: 1px solid ${T.border};
          border-radius: 8px;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          color: ${T.textPrimary};
          transition: border-color 0.15s;
        }
        .tk-note-input::placeholder { color: ${T.textMuted}; }
        .tk-note-input:focus { border-color: ${T.accent}; }
        .tk-note-add-btn {
          all: unset;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 34px;
          height: 34px;
          border-radius: 8px;
          background: ${T.accentDim};
          color: ${T.accent};
          cursor: pointer;
          flex-shrink: 0;
          transition: filter 0.15s;
        }
        .tk-note-add-btn:hover:not(:disabled) { filter: brightness(1.15); }
        .tk-note-add-btn:disabled { opacity: 0.4; cursor: not-allowed; }

        /* ── Empty ── */
        .tk-empty td {
          text-align: center;
          padding: 3rem;
          color: ${T.textMuted};
          font-size: 13.5px;
        }

        /* ── Delete confirm overlay ── */
        .tk-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 50;
        }
        .tk-confirm-card {
          background: ${T.surface};
          border: 1px solid ${T.border};
          border-radius: 16px;
          padding: 2rem;
          max-width: 360px;
          width: calc(100% - 2rem);
          box-sizing: border-box;
        }
        .tk-confirm-title {
          font-size: 16px;
          font-weight: 500;
          color: ${T.textPrimary};
          margin: 0 0 0.5rem;
        }
        .tk-confirm-sub {
          font-size: 13.5px;
          color: ${T.textSec};
          margin: 0 0 1.5rem;
        }
        .tk-confirm-actions {
          display: flex;
          gap: 0.625rem;
          justify-content: flex-end;
        }
        .tk-confirm-delete {
          all: unset;
          padding: 0.6rem 1.25rem;
          border-radius: 10px;
          background: ${T.red};
          color: #fff;
          font-family: 'DM Sans', sans-serif;
          font-size: 13.5px;
          font-weight: 500;
          cursor: pointer;
          transition: filter 0.15s;
        }
        .tk-confirm-delete:hover { filter: brightness(1.1); }

        /* ── Spinner ── */
        @keyframes tk-spin { to { transform: rotate(360deg); } }
        .tk-spinner-sm {
          width: 14px; height: 14px;
          border: 2px solid rgba(13,15,20,0.25);
          border-top-color: ${T.accent};
          border-radius: 50%;
          animation: tk-spin 0.7s linear infinite;
        }

        /* ── Footer ── */
        .tk-footer {
          display: flex;
          align-items: center;
          gap: 7px;
          font-size: 12px;
          color: ${T.textSec};
          padding-top: 1.5rem;
          margin-top: 2rem;
          border-top: 1px solid ${T.border};
        }
      `}</style>

      <div className="tk-root">
        <motion.div variants={stagger} initial="hidden" animate="show">

          {/* Header */}
          <motion.div className="tk-top-row" variants={fadeUp}>
            <div>
              <h1 className="tk-h1">Ticket Management</h1>
              <p className="tk-sub">Create, assign, and resolve support tickets.</p>
            </div>
            <motion.button
              className="tk-create-btn"
              onClick={() => setShowForm((v) => !v)}
              whileTap={{ scale: 0.97 }}
            >
              <PlusCircle size={15} strokeWidth={2} />
              {showForm ? "Cancel" : "New Ticket"}
            </motion.button>
          </motion.div>

          {/* Create form */}
          <AnimatePresence>
            {showForm && (
              <motion.div
                key="create-form"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="tk-form-card">
                  <p className="tk-form-title">
                    <Ticket size={15} strokeWidth={1.75} style={{ color: T.accent }} />
                    Create New Ticket
                  </p>

                  <form onSubmit={handleCreate}>
                    <div className="tk-form-grid">

                      <div className="tk-field tk-form-full">
                        <label className="tk-label">Subject</label>
                        <input
                          className="tk-input"
                          placeholder="Brief description of the issue"
                          value={fSubject}
                          onChange={(e) => setFSubject(e.target.value)}
                          required
                        />
                      </div>

                      <div className="tk-field tk-form-full">
                        <label className="tk-label">Description (optional)</label>
                        <textarea
                          className="tk-textarea"
                          placeholder="Provide more context…"
                          value={fDescription}
                          onChange={(e) => setFDescription(e.target.value)}
                        />
                      </div>

                      <div className="tk-field">
                        <label className="tk-label">Category</label>
                        <select
                          className="tk-select"
                          value={fCategory}
                          onChange={(e) => setFCategory(e.target.value as Department)}
                        >
                          {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
                        </select>
                      </div>

                      <div className="tk-field">
                        <label className="tk-label">Assign to Department</label>
                        <select
                          className="tk-select"
                          value={fAssignedTo}
                          onChange={(e) => setFAssignedTo(e.target.value as Department | "")}
                        >
                          <option value="">Unassigned</option>
                          {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
                        </select>
                      </div>

                      <div className="tk-field">
                        <label className="tk-label">Priority</label>
                        <div className="tk-priority-row">
                          {(["low","medium","high"] as Priority[]).map((p) => {
                            const cfg    = PRIORITY_CFG[p];
                            const active = fPriority === p;
                            return (
                              <button
                                key={p}
                                type="button"
                                className="tk-priority-btn"
                                style={active ? { background: cfg.dim, borderColor: cfg.color, color: cfg.color } : {}}
                                onClick={() => setFPriority(p)}
                              >
                                {p.charAt(0).toUpperCase() + p.slice(1)}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                    </div>

                    <div className="tk-form-actions">
                      <button type="button" className="tk-cancel-btn" onClick={() => setShowForm(false)}>
                        Cancel
                      </button>
                      <button className="tk-submit-btn" type="submit" disabled={creating}>
                        {creating
                          ? <><div className="tk-spinner-sm" />Creating…</>
                          : <><PlusCircle size={14} strokeWidth={2} />Create Ticket</>}
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Toolbar */}
          <motion.div variants={fadeUp}>
            <div className="tk-toolbar">
              <div className="tk-search-wrap">
                <span className="tk-search-icon"><Search size={14} strokeWidth={1.75} /></span>
                <input
                  className="tk-search"
                  placeholder="Search by ID, subject, user, category…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <Filter size={14} strokeWidth={1.75} style={{ color: T.textMuted, flexShrink: 0 }} />

              {(["all","open","in-progress","resolved","closed"] as const).map((s) => (
                <button
                  key={s}
                  className={`tk-filter-btn${filterStatus === s ? " active" : ""}`}
                  onClick={() => setFilter(s)}
                >
                  {s === "all" ? "All" : STATUS_CFG[s].label}
                </button>
              ))}
            </div>

            {/* Table */}
            <div className="tk-table-wrap">
              <table className="tk-table">
                <thead>
                  <tr>
                    {([
                      { key: "id",        label: "ID"           },
                      { key: "subject",   label: "Subject"      },
                      { key: "createdBy", label: "Submitted By" },
                      { key: "category",  label: "Category"     },
                      { key: "priority",  label: "Priority"     },
                      { key: "status",    label: "Status"       },
                      { key: "assignedTo",label: "Assigned To"  },
                      { key: "createdAt", label: "Date"         },
                      { key: null,        label: ""             },
                    ] as { key: keyof TicketType | null; label: string }[]).map(({ key, label }, i) => (
                      <th
                        key={i}
                        className="tk-th"
                        onClick={() => key && handleSort(key)}
                      >
                        <span className="tk-th-inner">
                          {label}
                          {key && <SortIcon field={key} />}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {filtered.length === 0 ? (
                      <tr className="tk-empty">
                        <td colSpan={9}>No tickets found.</td>
                      </tr>
                    ) : (
                      filtered.map((t) => (
                        <TicketRow
                          key={t.id}
                          ticket={t}
                          onUpdate={reload}
                          onDelete={handleDelete}
                        />
                      ))
                    )}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Footer */}
          <motion.div className="tk-footer" variants={fadeUp}>
            <Clock size={13} strokeWidth={1.75} />
            {filtered.length} of {tickets.length} tickets shown
          </motion.div>

        </motion.div>
      </div>

      {/* Delete confirmation overlay */}
      <AnimatePresence>
        {deleteId && (
          <motion.div
            className="tk-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setDeleteId(null)}
          >
            <motion.div
              className="tk-confirm-card"
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              <p className="tk-confirm-title">Delete this ticket?</p>
              <p className="tk-confirm-sub">
                This action cannot be undone. The ticket and all its notes will be permanently removed.
              </p>
              <div className="tk-confirm-actions">
                <button className="tk-cancel-btn" onClick={() => setDeleteId(null)}>
                  Cancel
                </button>
                <button className="tk-confirm-delete" onClick={confirmDelete}>
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}