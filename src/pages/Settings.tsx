import { AnimatePresence, motion } from "framer-motion";
import {
  Bell,
  BellOff,
  CheckCircle2,
  ChevronDown,
  Lock,
  Save,
  Settings,
  Shield,
  Trash2,
  TriangleAlert,
  UserCog,
  UserPlus,
  Users,
  X,
  Zap
} from "lucide-react";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";

// ─── Theme ────────────────────────────────────────────────────────────────────
const T = {
  bg:          "#0D0F14",
  surface:     "#13161D",
  surfaceHover:"#1A1E27",
  border:      "#252932",
  accent:      "#E8A838",
  accentDim:   "rgba(232,168,56,0.12)",
  accentBorder:"rgba(232,168,56,0.35)",
  textPrimary: "#F0EDE6",
  textSec:     "#7A8194",
  textMuted:   "#454B5C",
  green:       "#3DD68C",
  greenDim:    "rgba(61,214,140,0.12)",
  red:         "#E85656",
  redDim:      "rgba(232,86,86,0.12)",
  blue:        "#5B9CF6",
  blueDim:     "rgba(91,156,246,0.12)",
  yellow:      "#E8A838",
  yellowDim:   "rgba(232,168,56,0.12)",
};

// ─── Animations ───────────────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1] } },
};

// ─── localStorage helpers ─────────────────────────────────────────────────────
function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch { return fallback; }
}
function save(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
}

// ─── Types ────────────────────────────────────────────────────────────────────
type Role   = "admin" | "user";
type Status = "active" | "inactive";

interface AppUser {
  id:       string;
  name:     string;
  email:    string;
  role:     Role;
  status:   Status;
}

interface NotifSettings {
  emailEnabled:    boolean;
  highPriorityAlert: boolean;
  autoReply:       string;
}

interface SystemSettings {
  systemName:      string;
  orgName:         string;
  defaultPriority: "low" | "medium" | "high";
  defaultDept:     string;
}

interface SecuritySettings {
  minPasswordLength: number;
  sessionTimeout:    number; // minutes, 0 = never
}

// ─── Tabs config ──────────────────────────────────────────────────────────────
const TABS = [
  { id: "users",   label: "Users & Roles",  Icon: Users    },
  { id: "notifs",  label: "Notifications",  Icon: Bell     },
  { id: "system",  label: "System",         Icon: Settings },
  { id: "security",label: "Security",       Icon: Shield   },
] as const;

type TabId = typeof TABS[number]["id"];

const DEPARTMENTS = ["IT Support","Hardware","Network","Software","HR","Other"];
const ROLES: Role[] = ["admin","user"];

// ─── Subcomponent: Toast ──────────────────────────────────────────────────────
function Toast({ msg, onDone }: { msg: string; onDone: () => void }) {
  setTimeout(onDone, 3000);
  return (
    <motion.div
      className="st-toast"
      initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
    >
      <CheckCircle2 size={14} strokeWidth={2} /> {msg}
    </motion.div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabId>("users");
  const [toast, setToast]         = useState("");

  const showToast = (msg: string) => setToast(msg);

  // ── Users state ──
  const [users, setUsers] = useState<AppUser[]>(() =>
    load<AppUser[]>("st_users", [])
  );
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUser, setEditingUser]   = useState<AppUser | null>(null);
  const [uName, setUName]   = useState("");
  const [uEmail, setUEmail] = useState("");
  const [uRole, setURole]   = useState<Role>("user");
  const [uError, setUError] = useState("");

  // ── Notifications state ──
  const [notifs, setNotifs] = useState<NotifSettings>(() =>
    load<NotifSettings>("st_notifs", {
      emailEnabled:      true,
      highPriorityAlert: true,
      autoReply:         "Thank you for submitting your ticket. Our team will get back to you shortly.",
    })
  );

  // ── System state ──
  const [sys, setSys] = useState<SystemSettings>(() =>
    load<SystemSettings>("st_system", {
      systemName:      "Helpdesk",
      orgName:         "",
      defaultPriority: "medium",
      defaultDept:     "IT Support",
    })
  );

  // ── Security state ──
  const [sec, setSec] = useState<SecuritySettings>(() =>
    load<SecuritySettings>("st_security", {
      minPasswordLength: 6,
      sessionTimeout:    30,
    })
  );

  // ─── User handlers ───────────────────────────────────────────────────────
  const openCreateUser = () => {
    setEditingUser(null);
    setUName(""); setUEmail(""); setURole("user"); setUError("");
    setShowUserForm(true);
  };

  const openEditUser = (u: AppUser) => {
    setEditingUser(u);
    setUName(u.name); setUEmail(u.email); setURole(u.role); setUError("");
    setShowUserForm(true);
  };

  const handleSaveUser = () => {
    setUError("");
    if (!uName.trim())  { setUError("Name is required."); return; }
    if (!uEmail.trim()) { setUError("Email is required."); return; }
    const emailExists = users.some(
      (u) => u.email === uEmail.trim() && u.id !== editingUser?.id
    );
    if (emailExists) { setUError("Email already in use."); return; }

    let updated: AppUser[];
    if (editingUser) {
      updated = users.map((u) =>
        u.id === editingUser.id
          ? { ...u, name: uName.trim(), email: uEmail.trim(), role: uRole }
          : u
      );
    } else {
      updated = [...users, {
        id: uuidv4(), name: uName.trim(), email: uEmail.trim(),
        role: uRole, status: "active",
      }];
    }
    setUsers(updated);
    save("st_users", updated);
    setShowUserForm(false);
    showToast(editingUser ? "User updated." : "User created.");
  };

  const toggleUserStatus = (id: string) => {
    const updated = users.map((u) =>
      u.id === id ? { ...u, status: u.status === "active" ? "inactive" : "active" } : u
    ) as AppUser[];
    setUsers(updated);
    save("st_users", updated);
  };

  const deleteUser = (id: string) => {
    const updated = users.filter((u) => u.id !== id);
    setUsers(updated);
    save("st_users", updated);
    showToast("User deleted.");
  };

  // ─── Notif handlers ──────────────────────────────────────────────────────
  const saveNotifs = (patch: Partial<NotifSettings>) => {
    const updated = { ...notifs, ...patch };
    setNotifs(updated);
    save("st_notifs", updated);
    showToast("Notification settings saved.");
  };

  // ─── System handlers ─────────────────────────────────────────────────────
  const saveSys = () => {
    save("st_system", sys);
    showToast("System settings saved.");
  };

  // ─── Security handlers ───────────────────────────────────────────────────
  const saveSec = () => {
    if (sec.minPasswordLength < 4) { showToast("Minimum password length must be at least 4."); return; }
    save("st_security", sec);
    showToast("Security settings saved.");
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@400;500&display=swap');

        .st-root {
          padding: 2.5rem 2rem;
          font-family: 'DM Sans', sans-serif;
          color: ${T.textPrimary};
          box-sizing: border-box;
          max-width: 860px;
        }

        /* ── Page header ── */
        .st-h1 {
          font-family: 'Playfair Display', serif;
          font-size: 28px; font-weight: 700;
          color: ${T.textPrimary}; margin: 0 0 0.25rem;
          letter-spacing: -0.022em;
        }
        .st-sub { font-size: 13.5px; color: ${T.textSec}; margin: 0 0 2rem; }

        /* ── Toast ── */
        .st-toast {
          display: flex; align-items: center; gap: 8px;
          background: ${T.greenDim};
          border: 1px solid rgba(61,214,140,0.25);
          color: ${T.green}; border-radius: 11px;
          padding: 0.75rem 1rem; font-size: 13px;
          margin-bottom: 1.25rem;
        }

        /* ── Tabs ── */
        .st-tabs {
          display: flex; gap: 0.25rem;
          background: ${T.surface};
          border: 1px solid ${T.border};
          border-radius: 14px; padding: 0.25rem;
          margin-bottom: 1.75rem;
          flex-wrap: wrap;
        }
        .st-tab {
          all: unset;
          display: flex; align-items: center; gap: 6px;
          padding: 0.55rem 1rem;
          border-radius: 10px;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px; font-weight: 500;
          color: ${T.textSec}; cursor: pointer;
          transition: all 0.17s; white-space: nowrap;
        }
        .st-tab:hover { color: ${T.textPrimary}; background: ${T.surfaceHover}; }
        .st-tab.active { background: ${T.accentDim}; color: ${T.accent}; }
        .st-tab.active svg { color: ${T.accent}; }
        .st-tab svg { color: ${T.textMuted}; transition: color 0.17s; }

        /* ── Section card ── */
        .st-card {
          background: ${T.surface};
          border: 1px solid ${T.border};
          border-radius: 18px; padding: 1.75rem;
          margin-bottom: 1.25rem;
        }
        .st-card-title {
          font-size: 14px; font-weight: 500;
          color: ${T.textPrimary}; margin: 0 0 1.5rem;
          display: flex; align-items: center; gap: 7px;
          padding-bottom: 1rem;
          border-bottom: 1px solid ${T.border};
        }
        .st-card-title svg { color: ${T.accent}; }

        /* ── Field ── */
        .st-field { display: flex; flex-direction: column; gap: 0.35rem; margin-bottom: 1rem; }
        .st-label { font-size: 12px; font-weight: 500; color: ${T.textSec}; }
        .st-hint  { font-size: 11.5px; color: ${T.textMuted}; margin: 2px 0 0; }

        .st-input, .st-select, .st-textarea {
          all: unset;
          width: 100%;
          padding: 0.7rem 0.875rem;
          background: ${T.bg};
          border: 1px solid ${T.border};
          border-radius: 10px;
          font-family: 'DM Sans', sans-serif;
          font-size: 13.5px; color: ${T.textPrimary};
          box-sizing: border-box;
          transition: border-color 0.17s;
        }
        .st-input::placeholder, .st-textarea::placeholder { color: ${T.textMuted}; }
        .st-input:focus, .st-select:focus, .st-textarea:focus { border-color: ${T.accent}; }
        .st-textarea { resize: vertical; min-height: 80px; line-height: 1.55; }

        .st-select-wrap { position: relative; }
        .st-select-wrap svg {
          position: absolute; right: 10px; top: 50%;
          transform: translateY(-50%);
          pointer-events: none; color: ${T.textMuted};
        }

        .st-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.875rem; }
        @media (max-width: 580px) { .st-form-grid { grid-template-columns: 1fr; } }

        /* ── Buttons ── */
        .st-btn-primary {
          all: unset;
          display: inline-flex; align-items: center; gap: 6px;
          padding: 0.6rem 1.25rem; border-radius: 10px;
          background: ${T.accent}; color: #0D0F14;
          font-family: 'DM Sans', sans-serif;
          font-size: 13.5px; font-weight: 500; cursor: pointer;
          transition: filter 0.15s;
        }
        .st-btn-primary:hover { filter: brightness(1.08); }

        .st-btn-ghost {
          all: unset;
          display: inline-flex; align-items: center; gap: 6px;
          padding: 0.6rem 1.125rem; border-radius: 10px;
          border: 1px solid ${T.border};
          font-family: 'DM Sans', sans-serif;
          font-size: 13.5px; color: ${T.textSec}; cursor: pointer;
          transition: all 0.15s;
        }
        .st-btn-ghost:hover { background: ${T.surfaceHover}; color: ${T.textPrimary}; }

        .st-save-row {
          display: flex; justify-content: flex-end;
          padding-top: 1.25rem; margin-top: 0.25rem;
          border-top: 1px solid ${T.border};
        }

        /* ── Error ── */
        .st-error { font-size: 12.5px; color: ${T.red}; margin: 0 0 0.75rem; }

        /* ── Toggle ── */
        .st-toggle-row {
          display: flex; align-items: center;
          justify-content: space-between;
          padding: 0.875rem 0;
          border-bottom: 1px solid ${T.border};
        }
        .st-toggle-row:last-of-type { border-bottom: none; }
        .st-toggle-info { flex: 1; min-width: 0; }
        .st-toggle-label { font-size: 13.5px; color: ${T.textPrimary}; margin: 0 0 2px; }
        .st-toggle-desc  { font-size: 12px; color: ${T.textMuted}; margin: 0; }

        .st-toggle {
          position: relative;
          width: 40px; height: 22px;
          background: ${T.border};
          border-radius: 999px; cursor: pointer;
          flex-shrink: 0; margin-left: 1rem;
          transition: background 0.22s;
          border: none; padding: 0;
        }
        .st-toggle.on { background: ${T.accent}; }
        .st-toggle::after {
          content: '';
          position: absolute;
          top: 3px; left: 3px;
          width: 16px; height: 16px;
          border-radius: 50%; background: #fff;
          transition: transform 0.22s;
        }
        .st-toggle.on::after { transform: translateX(18px); }

        /* ── User table ── */
        .st-user-header {
          display: flex; align-items: center;
          justify-content: space-between; margin-bottom: 1rem;
        }
        .st-user-count {
          font-size: 12px; color: ${T.textMuted};
          letter-spacing: 0.04em;
        }

        .st-user-list { display: flex; flex-direction: column; gap: 0.5rem; }
        .st-user-row {
          display: flex; align-items: center; gap: 1rem;
          background: ${T.bg};
          border: 1px solid ${T.border};
          border-radius: 12px; padding: 0.875rem 1rem;
          transition: border-color 0.15s;
        }
        .st-user-row:hover { border-color: ${T.accentBorder}; }

        .st-user-avatar {
          width: 34px; height: 34px; border-radius: 9px;
          background: ${T.accentDim};
          border: 1px solid ${T.accentBorder};
          color: ${T.accent};
          display: flex; align-items: center; justify-content: center;
          font-size: 14px; font-weight: 600; flex-shrink: 0;
          font-family: 'Playfair Display', serif;
        }
        .st-user-name  { font-size: 13.5px; color: ${T.textPrimary}; margin: 0 0 2px; }
        .st-user-email { font-size: 12px; color: ${T.textSec}; margin: 0; }

        .st-badge {
          display: inline-flex; align-items: center; gap: 4px;
          padding: 2px 9px; border-radius: 20px;
          font-size: 11.5px; font-weight: 500; white-space: nowrap;
        }

        .st-user-actions { display: flex; gap: 0.375rem; margin-left: auto; flex-shrink: 0; }
        .st-icon-btn {
          all: unset;
          display: flex; align-items: center; justify-content: center;
          width: 30px; height: 30px; border-radius: 8px;
          color: ${T.textMuted}; cursor: pointer;
          transition: background 0.15s, color 0.15s;
        }
        .st-icon-btn:hover { background: ${T.surfaceHover}; color: ${T.textPrimary}; }
        .st-icon-btn.danger:hover { background: ${T.redDim}; color: ${T.red}; }

        /* ── Inline user form ── */
        .st-user-form {
          background: ${T.bg};
          border: 1px solid ${T.accentBorder};
          border-radius: 14px; padding: 1.25rem;
          margin-bottom: 1rem;
        }
        .st-user-form-title {
          font-size: 13.5px; font-weight: 500;
          color: ${T.textPrimary}; margin: 0 0 1rem;
          display: flex; align-items: center; gap: 6px;
        }
        .st-user-form-title svg { color: ${T.accent}; }
        .st-form-actions {
          display: flex; gap: 0.5rem;
          justify-content: flex-end;
          padding-top: 0.875rem; margin-top: 0.25rem;
          border-top: 1px solid ${T.border};
        }

        /* ── Number input ── */
        .st-number-row {
          display: flex; align-items: center; gap: 0.625rem;
        }
        .st-number {
          all: unset;
          width: 80px; padding: 0.65rem 0.875rem;
          background: ${T.bg}; border: 1px solid ${T.border};
          border-radius: 10px; font-family: 'DM Sans', sans-serif;
          font-size: 13.5px; color: ${T.textPrimary};
          box-sizing: border-box; transition: border-color 0.17s;
          text-align: center;
        }
        .st-number:focus { border-color: ${T.accent}; }
        .st-number-unit { font-size: 13px; color: ${T.textSec}; }

        /* ── Empty ── */
        .st-empty {
          text-align: center; padding: 2.5rem 1rem;
          color: ${T.textMuted}; font-size: 13.5px;
          background: ${T.bg}; border: 1px solid ${T.border};
          border-radius: 12px;
        }
      `}</style>

      <div className="st-root">
        <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.07 } } }}>

          {/* Header */}
          <motion.div variants={fadeUp}>
            <h1 className="st-h1">Settings</h1>
            <p className="st-sub">Configure your helpdesk system.</p>
          </motion.div>

          {/* Toast */}
          <AnimatePresence>
            {toast && <Toast key="toast" msg={toast} onDone={() => setToast("")} />}
          </AnimatePresence>

          {/* Tabs */}
          <motion.div className="st-tabs" variants={fadeUp}>
            {TABS.map(({ id, label, Icon }) => (
              <button
                key={id}
                className={`st-tab${activeTab === id ? " active" : ""}`}
                onClick={() => setActiveTab(id)}
              >
                <Icon size={14} strokeWidth={1.75} />
                {label}
              </button>
            ))}
          </motion.div>

          {/* ── Tab content ── */}
          <AnimatePresence mode="wait">

            {/* ════ USERS & ROLES ════ */}
            {activeTab === "users" && (
              <motion.div key="users" variants={fadeUp} initial="hidden" animate="show" exit={{ opacity: 0 }}>
                <div className="st-card">
                  <p className="st-card-title">
                    <Users size={15} strokeWidth={1.75} /> Users & Roles
                  </p>

                  <div className="st-user-header">
                    <span className="st-user-count">{users.length} user{users.length !== 1 ? "s" : ""}</span>
                    <button className="st-btn-primary" onClick={openCreateUser}>
                      <UserPlus size={14} strokeWidth={2} /> Add User
                    </button>
                  </div>

                  {/* Inline form */}
                  <AnimatePresence>
                    {showUserForm && (
                      <motion.div
                        key="user-form"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                      >
                        <div className="st-user-form">
                          <p className="st-user-form-title">
                            {editingUser
                              ? <><UserCog size={14} strokeWidth={1.75} /> Edit User</>
                              : <><UserPlus size={14} strokeWidth={1.75} /> New User</>}
                          </p>

                          <div className="st-form-grid">
                            <div className="st-field">
                              <label className="st-label">Name</label>
                              <input className="st-input" placeholder="Full name"
                                value={uName} onChange={(e) => setUName(e.target.value)} />
                            </div>
                            <div className="st-field">
                              <label className="st-label">Email</label>
                              <input className="st-input" type="email" placeholder="user@example.com"
                                value={uEmail} onChange={(e) => setUEmail(e.target.value)} />
                            </div>
                            <div className="st-field">
                              <label className="st-label">Role</label>
                              <div className="st-select-wrap">
                                <select className="st-select" value={uRole}
                                  onChange={(e) => setURole(e.target.value as Role)}>
                                  {ROLES.map((r) => (
                                    <option key={r} value={r}>
                                      {r.charAt(0).toUpperCase() + r.slice(1)}
                                    </option>
                                  ))}
                                </select>
                                <ChevronDown size={14} strokeWidth={2} />
                              </div>
                            </div>
                          </div>

                          {uError && <p className="st-error">{uError}</p>}

                          <div className="st-form-actions">
                            <button className="st-btn-ghost" onClick={() => setShowUserForm(false)}>
                              <X size={13} strokeWidth={2} /> Cancel
                            </button>
                            <button className="st-btn-primary" onClick={handleSaveUser}>
                              <Save size={13} strokeWidth={2} />
                              {editingUser ? "Update" : "Create"}
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* User list */}
                  {users.length === 0 ? (
                    <div className="st-empty">No users yet. Add one above.</div>
                  ) : (
                    <div className="st-user-list">
                      <AnimatePresence initial={false}>
                        {users.map((u) => {
                          const isActive = u.status === "active";
                          const roleColor = u.role === "admin" ? T.blue : T.accent;
                          const roleDim   = u.role === "admin" ? T.blueDim : T.accentDim;
                          return (
                            <motion.div
                              key={u.id}
                              className="st-user-row"
                              initial={{ opacity: 0, y: 6 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, x: -10 }}
                              transition={{ duration: 0.22 }}
                            >
                              <div className="st-user-avatar">
                                {u.name.charAt(0).toUpperCase()}
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <p className="st-user-name">{u.name}</p>
                                <p className="st-user-email">{u.email}</p>
                              </div>

                              {/* Role badge */}
                              <span className="st-badge"
                                style={{ background: roleDim, color: roleColor }}>
                                {u.role}
                              </span>

                              {/* Status badge */}
                              <span className="st-badge" style={{
                                background: isActive ? T.greenDim : T.border,
                                color:      isActive ? T.green    : T.textMuted,
                              }}>
                                {isActive ? "Active" : "Inactive"}
                              </span>

                              {/* Actions */}
                              <div className="st-user-actions">
                                <button className="st-icon-btn" onClick={() => openEditUser(u)} title="Edit">
                                  <UserCog size={14} strokeWidth={1.75} />
                                </button>
                                <button className="st-icon-btn" onClick={() => toggleUserStatus(u.id)}
                                  title={isActive ? "Deactivate" : "Activate"}>
                                  {isActive
                                    ? <BellOff size={14} strokeWidth={1.75} />
                                    : <Zap     size={14} strokeWidth={1.75} />}
                                </button>
                                <button className="st-icon-btn danger" onClick={() => deleteUser(u.id)} title="Delete">
                                  <Trash2 size={14} strokeWidth={1.75} />
                                </button>
                              </div>
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* ════ NOTIFICATIONS ════ */}
            {activeTab === "notifs" && (
              <motion.div key="notifs" variants={fadeUp} initial="hidden" animate="show" exit={{ opacity: 0 }}>
                <div className="st-card">
                  <p className="st-card-title">
                    <Bell size={15} strokeWidth={1.75} /> Notifications
                  </p>

                  {/* Toggles */}
                  <div className="st-toggle-row">
                    <div className="st-toggle-info">
                      <p className="st-toggle-label">Email Notifications</p>
                      <p className="st-toggle-desc">Send email updates on ticket activity</p>
                    </div>
                    <button
                      className={`st-toggle${notifs.emailEnabled ? " on" : ""}`}
                      onClick={() => saveNotifs({ emailEnabled: !notifs.emailEnabled })}
                    />
                  </div>

                  <div className="st-toggle-row" style={{ marginBottom: "1.25rem" }}>
                    <div className="st-toggle-info">
                      <p className="st-toggle-label">
                        <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                          <TriangleAlert size={13} strokeWidth={2} style={{ color: T.yellow }} />
                          High Priority Alerts
                        </span>
                      </p>
                      <p className="st-toggle-desc">Get notified immediately when a high-priority ticket is submitted</p>
                    </div>
                    <button
                      className={`st-toggle${notifs.highPriorityAlert ? " on" : ""}`}
                      onClick={() => saveNotifs({ highPriorityAlert: !notifs.highPriorityAlert })}
                    />
                  </div>

                  {/* Auto-reply */}
                  <div className="st-field">
                    <label className="st-label">Auto-Reply Message</label>
                    <p className="st-hint">Sent automatically when a user submits a ticket</p>
                    <textarea
                      className="st-textarea"
                      style={{ marginTop: "0.5rem" }}
                      value={notifs.autoReply}
                      onChange={(e) => setNotifs({ ...notifs, autoReply: e.target.value })}
                    />
                  </div>

                  <div className="st-save-row">
                    <button className="st-btn-primary"
                      onClick={() => saveNotifs({ autoReply: notifs.autoReply })}>
                      <Save size={14} strokeWidth={2} /> Save Changes
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ════ SYSTEM ════ */}
            {activeTab === "system" && (
              <motion.div key="system" variants={fadeUp} initial="hidden" animate="show" exit={{ opacity: 0 }}>
                <div className="st-card">
                  <p className="st-card-title">
                    <Settings size={15} strokeWidth={1.75} /> System Settings
                  </p>

                  <div className="st-form-grid">
                    <div className="st-field">
                      <label className="st-label">System Name</label>
                      <input className="st-input" placeholder="e.g. Helpdesk"
                        value={sys.systemName}
                        onChange={(e) => setSys({ ...sys, systemName: e.target.value })} />
                    </div>
                    <div className="st-field">
                      <label className="st-label">Organization / Company Name</label>
                      <input className="st-input" placeholder="e.g. Acme Corp"
                        value={sys.orgName}
                        onChange={(e) => setSys({ ...sys, orgName: e.target.value })} />
                    </div>
                  </div>

                  <div className="st-form-grid" style={{ marginTop: "0.25rem" }}>
                    <div className="st-field">
                      <label className="st-label">Default Ticket Priority</label>
                      <div className="st-select-wrap">
                        <select className="st-select" value={sys.defaultPriority}
                          onChange={(e) => setSys({ ...sys, defaultPriority: e.target.value as SystemSettings["defaultPriority"] })}>
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                        </select>
                        <ChevronDown size={14} strokeWidth={2} />
                      </div>
                    </div>
                    <div className="st-field">
                      <label className="st-label">Default Assigned Department</label>
                      <div className="st-select-wrap">
                        <select className="st-select" value={sys.defaultDept}
                          onChange={(e) => setSys({ ...sys, defaultDept: e.target.value })}>
                          {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
                        </select>
                        <ChevronDown size={14} strokeWidth={2} />
                      </div>
                    </div>
                  </div>

                  <div className="st-save-row">
                    <button className="st-btn-primary" onClick={saveSys}>
                      <Save size={14} strokeWidth={2} /> Save Changes
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ════ SECURITY ════ */}
            {activeTab === "security" && (
              <motion.div key="security" variants={fadeUp} initial="hidden" animate="show" exit={{ opacity: 0 }}>
                <div className="st-card">
                  <p className="st-card-title">
                    <Lock size={15} strokeWidth={1.75} /> Security
                  </p>

                  {/* Min password length */}
                  <div className="st-field" style={{ marginBottom: "1.5rem" }}>
                    <label className="st-label">Minimum Password Length</label>
                    <p className="st-hint">Applies to all user accounts. Minimum allowed value is 4.</p>
                    <div className="st-number-row" style={{ marginTop: "0.625rem" }}>
                      <input
                        className="st-number"
                        type="number" min={4} max={32}
                        value={sec.minPasswordLength}
                        onChange={(e) => setSec({ ...sec, minPasswordLength: Number(e.target.value) })}
                      />
                      <span className="st-number-unit">characters</span>
                    </div>
                  </div>

                  {/* Session timeout */}
                  <div className="st-field">
                    <label className="st-label">Session Timeout</label>
                    <p className="st-hint">Automatically log out inactive users. Set to 0 to disable.</p>
                    <div className="st-number-row" style={{ marginTop: "0.625rem" }}>
                      <input
                        className="st-number"
                        type="number" min={0} max={1440}
                        value={sec.sessionTimeout}
                        onChange={(e) => setSec({ ...sec, sessionTimeout: Number(e.target.value) })}
                      />
                      <span className="st-number-unit">
                        {sec.sessionTimeout === 0 ? "minutes (disabled)" : "minutes"}
                      </span>
                    </div>
                  </div>

                  <div className="st-save-row">
                    <button className="st-btn-primary" onClick={saveSec}>
                      <Save size={14} strokeWidth={2} /> Save Changes
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>

          {/* Bottom padding */}
          <div style={{ height: "2rem" }} />
        </motion.div>
      </div>
    </>
  );
}