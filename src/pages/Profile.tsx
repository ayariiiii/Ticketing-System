import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCircle2,
  Eye,
  EyeOff,
  ImageIcon,
  KeyRound,
  Pencil,
  Save,
  ShieldCheck,
  Trash2,
  User,
  X,
} from "lucide-react";
import { useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import admins from "../data/admins.json";

// ─── Theme ────────────────────────────────────────────────────────────────────
const T = {
  bg:           "#0D0F14",
  surface:      "#13161D",
  surfaceHover: "#1A1E27",
  border:       "#252932",
  accent:       "#E8A838",
  accentDim:    "rgba(232,168,56,0.12)",
  accentBorder: "rgba(232,168,56,0.35)",
  textPrimary:  "#F0EDE6",
  textSec:      "#7A8194",
  textMuted:    "#454B5C",
  green:        "#3DD68C",
  greenDim:     "rgba(61,214,140,0.12)",
  red:          "#E85656",
  redDim:       "rgba(232,86,86,0.12)",
  blue:         "#5B9CF6",
  blueDim:      "rgba(91,156,246,0.12)",
};

const stagger = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.09, delayChildren: 0.08 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.42, ease: [0.22, 1, 0.36, 1] } },
};

// ─── localStorage helpers ─────────────────────────────────────────────────────
const PROFILE_KEY = "admin_profile";
const AVATAR_KEY  = "admin_avatar";

interface StoredProfile { name: string; email: string; }

function getStoredProfile(fallbackName: string, fallbackEmail: string): StoredProfile {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (raw) return JSON.parse(raw) as StoredProfile;
  } catch { /* ignore */ }
  return { name: fallbackName, email: fallbackEmail };
}

function getStoredAvatar(): string | null {
  try { return localStorage.getItem(AVATAR_KEY); } catch { return null; }
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function Profile() {
  const { user, updateUser } = useAuth();

  const stored = getStoredProfile(user?.name ?? "", user?.email ?? "");

  // ── Info edit state ──
  const [editingInfo, setEditingInfo] = useState(false);
  const [nameVal, setNameVal]         = useState(stored.name);
  const [emailVal, setEmailVal]       = useState(stored.email);
  const [infoSaving, setInfoSaving]   = useState(false);
  const [infoSuccess, setInfoSuccess] = useState(false);
  const [infoError, setInfoError]     = useState("");

  // ── Password state ──
  const [editingPw, setEditingPw]     = useState(false);
  const [currentPw, setCurrentPw]     = useState("");
  const [newPw, setNewPw]             = useState("");
  const [confirmPw, setConfirmPw]     = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew]         = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pwSaving, setPwSaving]       = useState(false);
  const [pwSuccess, setPwSuccess]     = useState(false);
  const [pwError, setPwError]         = useState("");

  // ── Display state ──
  const [displayName, setDisplayName]   = useState(stored.name);
  const [displayEmail, setDisplayEmail] = useState(stored.email);

  // ── Avatar state ──
  const [avatar, setAvatar]               = useState<string | null>(() => getStoredAvatar());
  const [avatarError, setAvatarError]     = useState("");
  const [avatarSuccess, setAvatarSuccess] = useState(false);
  const fileInputRef                      = useRef<HTMLInputElement>(null);

  // ─── Handlers ─────────────────────────────────────────────────────────────
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAvatarError("");
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { setAvatarError("Only image files are allowed."); return; }
    if (file.size > 5 * 1024 * 1024)    { setAvatarError("File exceeds the 5 MB limit."); return; }
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      localStorage.setItem(AVATAR_KEY, base64);
      setAvatar(base64);
      setAvatarSuccess(true);
      setTimeout(() => setAvatarSuccess(false), 3500);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleAvatarRemove = () => {
    localStorage.removeItem(AVATAR_KEY);
    setAvatar(null);
    setAvatarError("");
  };

  const handleSaveInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setInfoError("");
    if (!nameVal.trim() || !emailVal.trim()) { setInfoError("Name and email cannot be empty."); return; }
    setInfoSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    const updated: StoredProfile = { name: nameVal.trim(), email: emailVal.trim() };
    localStorage.setItem(PROFILE_KEY, JSON.stringify(updated));
    if (user) updateUser({ ...user, name: updated.name, email: updated.email });
    setDisplayName(updated.name);
    setDisplayEmail(updated.email);
    setInfoSaving(false);
    setInfoSuccess(true);
    setEditingInfo(false);
    setTimeout(() => setInfoSuccess(false), 3500);
  };

  const handleCancelInfo = () => {
    setNameVal(displayName); setEmailVal(displayEmail);
    setInfoError(""); setEditingInfo(false);
  };

  const handleSavePw = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError("");
    const currentStored = localStorage.getItem("admin_password") ?? admins[0]?.password ?? "";
    if (currentPw !== currentStored) { setPwError("Current password is incorrect."); return; }
    if (newPw.length < 6)            { setPwError("New password must be at least 6 characters."); return; }
    if (newPw !== confirmPw)         { setPwError("Passwords do not match."); return; }
    setPwSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    localStorage.setItem("admin_password", newPw);
    setCurrentPw(""); setNewPw(""); setConfirmPw("");
    setPwSaving(false); setPwSuccess(true); setEditingPw(false);
    setTimeout(() => setPwSuccess(false), 3500);
  };

  const handleCancelPw = () => {
    setCurrentPw(""); setNewPw(""); setConfirmPw("");
    setPwError(""); setEditingPw(false);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@400;500&display=swap');

        .pf-root {
          padding: 2.5rem 2rem;
          font-family: 'DM Sans', sans-serif;
          color: ${T.textPrimary};
          box-sizing: border-box;
          max-width: 960px;
          margin: 0 auto;
        }

        .pf-h1 {
          font-family: 'Playfair Display', serif;
          font-size: 28px;
          font-weight: 700;
          color: ${T.textPrimary};
          margin: 0 0 0.25rem;
          letter-spacing: -0.022em;
        }
        .pf-sub { font-size: 13.5px; color: ${T.textSec}; margin: 0 0 2rem; }

        /* ── Toasts ── */
        .pf-toast {
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

        /* ── Hero card ── */
        .pf-hero {
          background: ${T.surface};
          border: 1px solid ${T.border};
          border-radius: 22px;
          padding: 2rem 2rem;
          margin-bottom: 1.5rem;
          display: flex;
          flex-direction: row;
          align-items: center;
          gap: 2rem;
          position: relative;
          overflow: hidden;
        }
        .pf-hero::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, ${T.accent}, transparent);
          opacity: 0.5;
        }

        /* ── Avatar left column ── */
        .pf-avatar-wrap {
          position: relative;
          cursor: pointer;
          flex-shrink: 0;
        }
        .pf-avatar {
          width: 108px;
          height: 108px;
          border-radius: 28px;
          background: ${T.accentDim};
          border: 2px solid ${T.accentBorder};
          display: flex;
          align-items: center;
          justify-content: center;
          color: ${T.accent};
          font-family: 'Playfair Display', serif;
          font-size: 42px;
          font-weight: 700;
          user-select: none;
        }
        .pf-avatar-img {
          width: 108px;
          height: 108px;
          border-radius: 28px;
          object-fit: cover;
          border: 2px solid ${T.accentBorder};
          display: block;
        }
        .pf-avatar-overlay {
          position: absolute;
          inset: 0;
          border-radius: 28px;
          background: rgba(0,0,0,0.52);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 5px;
          opacity: 0;
          transition: opacity 0.18s;
          color: #fff;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.04em;
        }
        .pf-avatar-wrap:hover .pf-avatar-overlay { opacity: 1; }

        /* ── Hero right column ── */
        .pf-hero-info { flex: 1; min-width: 0; }
        .pf-hero-name {
          font-size: 20px;
          font-weight: 500;
          color: ${T.textPrimary};
          margin: 0 0 4px;
          letter-spacing: -0.01em;
        }
        .pf-hero-email { font-size: 13.5px; color: ${T.textSec}; margin: 0 0 0.75rem; }
        .pf-role-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 4px 12px;
          border-radius: 20px;
          background: ${T.blueDim};
          color: ${T.blue};
          font-size: 12px;
          font-weight: 500;
          margin-bottom: 1rem;
        }

        /* ── Remove button only ── */
        .pf-remove-btn {
          all: unset;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 0.4rem 0.875rem;
          border-radius: 9px;
          border: 1px solid ${T.border};
          font-family: 'DM Sans', sans-serif;
          font-size: 12.5px;
          color: ${T.textSec};
          cursor: pointer;
          transition: all 0.15s;
        }
        .pf-remove-btn:hover { border-color: ${T.red}; color: ${T.red}; background: ${T.redDim}; }
        .pf-photo-hint { font-size: 11.5px; color: ${T.textMuted}; margin: 0.5rem 0 0; }
        .pf-photo-err  { font-size: 12px; color: ${T.red}; margin: 0.5rem 0 0; }

        /* ── Two-column grid ── */
        .pf-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.25rem;
          align-items: start;
        }
        @media (max-width: 680px) { .pf-grid { grid-template-columns: 1fr; } }

        /* ── Cards ── */
        .pf-card {
          background: ${T.surface};
          border: 1px solid ${T.border};
          border-radius: 18px;
          padding: 1.5rem;
          overflow: hidden;
        }
        .pf-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.25rem;
        }
        .pf-card-title {
          font-size: 13.5px;
          font-weight: 500;
          color: ${T.textPrimary};
          margin: 0;
          display: flex;
          align-items: center;
          gap: 7px;
        }
        .pf-card-title svg { color: ${T.accent}; }

        .pf-edit-btn {
          all: unset;
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 0.35rem 0.75rem;
          border-radius: 8px;
          border: 1px solid ${T.border};
          font-family: 'DM Sans', sans-serif;
          font-size: 12px;
          color: ${T.textSec};
          cursor: pointer;
          transition: all 0.15s;
        }
        .pf-edit-btn:hover { border-color: ${T.accent}; color: ${T.accent}; background: ${T.accentDim}; }

        /* ── Info rows ── */
        .pf-info-rows { display: flex; flex-direction: column; gap: 0.75rem; }
        .pf-info-row {
          display: flex;
          flex-direction: column;
          gap: 3px;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid ${T.border};
        }
        .pf-info-row:last-child { border-bottom: none; padding-bottom: 0; }
        .pf-info-label {
          font-size: 10.5px;
          font-weight: 500;
          letter-spacing: 0.09em;
          text-transform: uppercase;
          color: ${T.textMuted};
        }
        .pf-info-value { font-size: 13.5px; color: ${T.textPrimary}; }

        /* ── Form ── */
        .pf-field { display: flex; flex-direction: column; gap: 0.35rem; margin-bottom: 0.875rem; }
        .pf-label { font-size: 12px; font-weight: 500; color: ${T.textSec}; }

        .pf-input-wrap { position: relative; display: flex; align-items: center; }
        .pf-input {
          all: unset;
          width: 100%;
          padding: 0.65rem 0.875rem;
          background: ${T.bg};
          border: 1px solid ${T.border};
          border-radius: 10px;
          font-family: 'DM Sans', sans-serif;
          font-size: 13.5px;
          color: ${T.textPrimary};
          box-sizing: border-box;
          transition: border-color 0.17s;
        }
        .pf-input::placeholder { color: ${T.textMuted}; }
        .pf-input:focus { border-color: ${T.accent}; }
        .pf-input-pw { padding-right: 2.75rem; }

        .pf-pw-toggle {
          position: absolute; right: 10px;
          background: none; border: none; padding: 4px;
          cursor: pointer; color: ${T.textMuted};
          display: flex; align-items: center; transition: color 0.15s;
        }
        .pf-pw-toggle:hover { color: ${T.textSec}; }

        /* ── Form actions ── */
        .pf-form-actions {
          display: flex; gap: 0.5rem; justify-content: flex-end;
          padding-top: 1rem; margin-top: 0.25rem;
          border-top: 1px solid ${T.border}; flex-wrap: wrap;
        }
        .pf-cancel-btn {
          all: unset;
          padding: 0.55rem 1rem; border-radius: 9px;
          border: 1px solid ${T.border};
          font-family: 'DM Sans', sans-serif; font-size: 13px;
          color: ${T.textSec}; cursor: pointer;
          display: flex; align-items: center; gap: 5px;
          transition: background 0.15s;
        }
        .pf-cancel-btn:hover { background: ${T.surfaceHover}; }
        .pf-save-btn {
          all: unset;
          display: flex; align-items: center; gap: 6px;
          padding: 0.55rem 1.125rem; border-radius: 9px;
          background: ${T.accent}; color: #0D0F14;
          font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 500;
          cursor: pointer; transition: filter 0.15s;
        }
        .pf-save-btn:hover:not(:disabled) { filter: brightness(1.08); }
        .pf-save-btn:disabled { opacity: 0.55; cursor: not-allowed; }

        .pf-error { font-size: 12.5px; color: ${T.red}; margin: 0 0 0.75rem; }

        @keyframes pf-spin { to { transform: rotate(360deg); } }
        .pf-spinner {
          width: 13px; height: 13px;
          border: 2px solid rgba(13,15,20,0.25);
          border-top-color: #0D0F14; border-radius: 50%;
          animation: pf-spin 0.7s linear infinite; flex-shrink: 0;
        }
      `}</style>

      <div className="pf-root">
        <motion.div variants={stagger} initial="hidden" animate="show">

          {/* Page header */}
          <motion.div variants={fadeUp}>
            <h1 className="pf-h1">Profile</h1>
            <p className="pf-sub">Manage your account information and credentials.</p>
          </motion.div>

          {/* Toasts */}
          <AnimatePresence>
            {infoSuccess && (
              <motion.div className="pf-toast" key="info-toast"
                initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <CheckCircle2 size={15} strokeWidth={2} /> Profile updated successfully.
              </motion.div>
            )}
            {pwSuccess && (
              <motion.div className="pf-toast" key="pw-toast"
                initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <CheckCircle2 size={15} strokeWidth={2} /> Password changed successfully.
              </motion.div>
            )}
            {avatarSuccess && (
              <motion.div className="pf-toast" key="avatar-toast"
                initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <CheckCircle2 size={15} strokeWidth={2} /> Profile picture updated.
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Hero card ── */}
          <motion.div className="pf-hero" variants={fadeUp}>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleAvatarUpload}
            />

            {/* Avatar — left side, click to change */}
            <div className="pf-avatar-wrap" onClick={() => fileInputRef.current?.click()}>
              {avatar
                ? <img src={avatar} alt="Profile" className="pf-avatar-img" />
                : <div className="pf-avatar">{displayName.charAt(0).toUpperCase()}</div>
              }
              <div className="pf-avatar-overlay">
                <ImageIcon size={20} strokeWidth={1.75} />
                <span>Change photo</span>
              </div>
            </div>

            {/* Info — right side */}
            <div className="pf-hero-info">
              <p className="pf-hero-name">{displayName}</p>
              <p className="pf-hero-email">{displayEmail}</p>
              <div>
                <span className="pf-role-badge">
                  <ShieldCheck size={12} strokeWidth={2} />
                  Administrator
                </span>
              </div>

              {avatar && (
                <button className="pf-remove-btn" type="button" onClick={handleAvatarRemove}
                  style={{ marginTop: "0.75rem" }}>
                  <Trash2 size={12} strokeWidth={2} />
                  Remove Photo
                </button>
              )}

            </div>
          </motion.div>

          {/* ── Two-column grid ── */}
          <motion.div className="pf-grid" variants={fadeUp}>

            {/* Left — Account Information */}
            <div className="pf-card">
              <div className="pf-card-header">
                <p className="pf-card-title">
                  <User size={14} strokeWidth={1.75} />
                  Account Information
                </p>
                {!editingInfo && (
                  <button className="pf-edit-btn" onClick={() => setEditingInfo(true)}>
                    <Pencil size={11} strokeWidth={2} /> Edit
                  </button>
                )}
              </div>

              <AnimatePresence mode="wait">
                {!editingInfo ? (
                  <motion.div key="read" className="pf-info-rows"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}>
                    <div className="pf-info-row">
                      <span className="pf-info-label">Name</span>
                      <span className="pf-info-value">{displayName}</span>
                    </div>
                    <div className="pf-info-row">
                      <span className="pf-info-label">Email</span>
                      <span className="pf-info-value">{displayEmail}</span>
                    </div>
                    <div className="pf-info-row">
                      <span className="pf-info-label">Role</span>
                      <span className="pf-info-value" style={{ textTransform: "capitalize" }}>{user?.role}</span>
                    </div>
                    <div className="pf-info-row">
                      <span className="pf-info-label">Account ID</span>
                      <span className="pf-info-value" style={{ color: T.textSec, fontFamily: "monospace", fontSize: 12 }}>{user?.id}</span>
                    </div>
                  </motion.div>
                ) : (
                  <motion.form key="edit" onSubmit={handleSaveInfo}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}>
                    <div className="pf-field">
                      <label className="pf-label">Name</label>
                      <input className="pf-input" value={nameVal}
                        onChange={(e) => setNameVal(e.target.value)} placeholder="Your name" />
                    </div>
                    <div className="pf-field">
                      <label className="pf-label">Email</label>
                      <input className="pf-input" type="email" value={emailVal}
                        onChange={(e) => setEmailVal(e.target.value)} placeholder="Your email" />
                    </div>
                    {infoError && <p className="pf-error">{infoError}</p>}
                    <div className="pf-form-actions">
                      <button type="button" className="pf-cancel-btn" onClick={handleCancelInfo}>
                        <X size={12} strokeWidth={2} /> Cancel
                      </button>
                      <button className="pf-save-btn" type="submit" disabled={infoSaving}>
                        {infoSaving
                          ? <><div className="pf-spinner" />Saving…</>
                          : <><Save size={13} strokeWidth={2} />Save</>}
                      </button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>

            {/* Right — Change Password */}
            <div className="pf-card">
              <div className="pf-card-header">
                <p className="pf-card-title">
                  <KeyRound size={14} strokeWidth={1.75} />
                  Change Password
                </p>
                {!editingPw && (
                  <button className="pf-edit-btn" onClick={() => setEditingPw(true)}>
                    <Pencil size={11} strokeWidth={2} /> Change
                  </button>
                )}
              </div>

              <AnimatePresence mode="wait">
                {!editingPw ? (
                  <motion.div key="pw-read" className="pf-info-rows"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}>
                    <div className="pf-info-row">
                      <span className="pf-info-label">Password</span>
                      <span className="pf-info-value" style={{ letterSpacing: "0.2em" }}>••••••••</span>
                    </div>
                  </motion.div>
                ) : (
                  <motion.form key="pw-edit" onSubmit={handleSavePw}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}>
                    <div className="pf-field">
                      <label className="pf-label">Current Password</label>
                      <div className="pf-input-wrap">
                        <input className="pf-input pf-input-pw"
                          type={showCurrent ? "text" : "password"} placeholder="••••••••"
                          value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} />
                        <button type="button" className="pf-pw-toggle"
                          onClick={() => setShowCurrent(v => !v)} tabIndex={-1}>
                          {showCurrent ? <EyeOff size={14} strokeWidth={1.75} /> : <Eye size={14} strokeWidth={1.75} />}
                        </button>
                      </div>
                    </div>
                    <div className="pf-field">
                      <label className="pf-label">New Password</label>
                      <div className="pf-input-wrap">
                        <input className="pf-input pf-input-pw"
                          type={showNew ? "text" : "password"} placeholder="Min. 6 characters"
                          value={newPw} onChange={(e) => setNewPw(e.target.value)} />
                        <button type="button" className="pf-pw-toggle"
                          onClick={() => setShowNew(v => !v)} tabIndex={-1}>
                          {showNew ? <EyeOff size={14} strokeWidth={1.75} /> : <Eye size={14} strokeWidth={1.75} />}
                        </button>
                      </div>
                    </div>
                    <div className="pf-field">
                      <label className="pf-label">Confirm New Password</label>
                      <div className="pf-input-wrap">
                        <input className="pf-input pf-input-pw"
                          type={showConfirm ? "text" : "password"} placeholder="Repeat new password"
                          value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} />
                        <button type="button" className="pf-pw-toggle"
                          onClick={() => setShowConfirm(v => !v)} tabIndex={-1}>
                          {showConfirm ? <EyeOff size={14} strokeWidth={1.75} /> : <Eye size={14} strokeWidth={1.75} />}
                        </button>
                      </div>
                    </div>
                    {pwError && <p className="pf-error">{pwError}</p>}
                    <div className="pf-form-actions">
                      <button type="button" className="pf-cancel-btn" onClick={handleCancelPw}>
                        <X size={12} strokeWidth={2} /> Cancel
                      </button>
                      <button className="pf-save-btn" type="submit" disabled={pwSaving}>
                        {pwSaving
                          ? <><div className="pf-spinner" />Saving…</>
                          : <><KeyRound size={13} strokeWidth={2} />Update</>}
                      </button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>

          </motion.div>
        </motion.div>
      </div>
    </>
  );
}