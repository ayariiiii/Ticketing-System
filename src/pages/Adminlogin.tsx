import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Eye, EyeOff, Lock, Mail, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import admins from "../data/admins.json";

// ─── Theme ────────────────────────────────────────────────────────────────────
const T = {
  bg:          "#0A0C10",
  surface:     "#0F1218",
  surfaceHover:"#161B24",
  border:      "#1E2330",
  accent:      "#5B9CF6",
  accentDim:   "rgba(91,156,246,0.12)",
  accentGlow:  "rgba(91,156,246,0.18)",
  accentBorder:"rgba(91,156,246,0.35)",
  textPrimary: "#EDF0F7",
  textSec:     "#6B7490",
  textMuted:   "#3A3F52",
  danger:      "#E85656",
};

const stagger = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.08, delayChildren: 0.2 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.42, ease: [0.22, 1, 0.36, 1] } },
};

export default function AdminLogin() {
  const { login }   = useAuth();
  const navigate    = useNavigate();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setError("All fields are required.");
      return;
    }

    setError("");
    setLoading(true);

    // Simulate network delay
    await new Promise((r) => setTimeout(r, 800));

    const match = admins.find(
      (a) => a.email === email && a.password === password
    );

    if (!match) {
      setError("Invalid email or password.");
      setLoading(false);
      return;
    }

    login("admin");
    navigate("/admin/dashboard");
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@400;500&display=swap');

        html, body, #root { height: 100%; margin: 0; padding: 0; }

        .al-root {
          height: 100%;
          min-height: 100dvh;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: ${T.bg};
          font-family: 'DM Sans', sans-serif;
          position: relative;
          overflow: hidden;
        }

        .al-root::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: radial-gradient(circle, ${T.border} 1px, transparent 1px);
          background-size: 28px 28px;
          opacity: 0.6;
          pointer-events: none;
        }

        .al-root::after {
          content: '';
          position: absolute;
          width: 680px;
          height: 680px;
          border-radius: 50%;
          background: radial-gradient(circle, ${T.accentGlow} 0%, transparent 65%);
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          pointer-events: none;
        }

        .al-card {
          position: relative;
          z-index: 1;
          width: calc(100% - 2.5rem);
          max-width: 420px;
          margin: 0 auto;
          background: ${T.surface};
          border: 1px solid ${T.border};
          border-radius: 22px;
          padding: 2.5rem 2.25rem;
          box-sizing: border-box;
        }

        .al-logo {
          width: 48px;
          height: 48px;
          border-radius: 13px;
          background: ${T.accentDim};
          border: 1px solid ${T.accentBorder};
          display: flex;
          align-items: center;
          justify-content: center;
          color: ${T.accent};
          margin-bottom: 1.5rem;
        }

        .al-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: ${T.accent};
          background: ${T.accentDim};
          border: 1px solid ${T.accentBorder};
          padding: 4px 10px;
          border-radius: 20px;
          margin-bottom: 1rem;
        }

        .al-h1 {
          font-family: 'Playfair Display', serif;
          font-size: 27px;
          font-weight: 700;
          color: ${T.textPrimary};
          margin: 0 0 0.3rem;
          letter-spacing: -0.022em;
          line-height: 1.2;
        }

        .al-sub {
          font-size: 13.5px;
          color: ${T.textSec};
          margin: 0 0 2rem;
        }

        .al-field {
          display: flex;
          flex-direction: column;
          gap: 0.375rem;
          margin-bottom: 1rem;
        }

        .al-label {
          font-size: 12px;
          font-weight: 500;
          color: ${T.textSec};
          letter-spacing: 0.02em;
        }

        .al-input-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }

        .al-input-icon {
          position: absolute;
          left: 12px;
          color: ${T.textMuted};
          display: flex;
          pointer-events: none;
        }

        .al-input {
          all: unset;
          width: 100%;
          padding: 0.75rem 1rem 0.75rem 2.5rem;
          background: ${T.bg};
          border: 1px solid ${T.border};
          border-radius: 11px;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          color: ${T.textPrimary};
          box-sizing: border-box;
          transition: border-color 0.17s;
        }

        .al-input::placeholder { color: ${T.textMuted}; }
        .al-input:focus { border-color: ${T.accent}; }

        .al-pw-toggle {
          position: absolute;
          right: 11px;
          background: none;
          border: none;
          padding: 4px;
          cursor: pointer;
          color: ${T.textMuted};
          display: flex;
          align-items: center;
          transition: color 0.15s;
        }
        .al-pw-toggle:hover { color: ${T.textSec}; border-color: transparent !important; }

        .al-error {
          font-size: 12.5px;
          color: ${T.danger};
          margin: 0 0 1rem;
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .al-divider { border: none; border-top: 1px solid ${T.border}; margin: 1.5rem 0; }

        .al-btn {
          all: unset;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          width: 100%;
          padding: 0.875rem 1.25rem;
          border-radius: 13px;
          background: ${T.accent};
          color: #0A0C10;
          font-family: 'DM Sans', sans-serif;
          font-size: 15px;
          font-weight: 500;
          cursor: pointer;
          box-sizing: border-box;
          transition: filter 0.17s;
          letter-spacing: 0.01em;
        }
        .al-btn:hover:not(:disabled) { filter: brightness(1.1); }
        .al-btn:disabled { opacity: 0.55; cursor: not-allowed; }

        @keyframes al-spin { to { transform: rotate(360deg); } }
        .al-spinner {
          width: 16px; height: 16px;
          border: 2px solid rgba(10,12,16,0.25);
          border-top-color: #0A0C10;
          border-radius: 50%;
          animation: al-spin 0.7s linear infinite;
          flex-shrink: 0;
        }

        .al-back {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          margin-top: 1.375rem;
          font-size: 12.5px;
          color: ${T.textMuted};
          text-decoration: none;
          transition: color 0.15s;
        }
        .al-back:hover { color: ${T.textSec}; }
      `}</style>

      <div className="al-root">
        <motion.div
          className="al-card"
          initial={{ opacity: 0, y: 28, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.52, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.div variants={stagger} initial="hidden" animate="show">

            <motion.div variants={fadeUp}>
              <div className="al-logo">
                <ShieldCheck size={22} strokeWidth={1.75} />
              </div>
              <div className="al-badge">
                <ShieldCheck size={11} strokeWidth={2} />
                Admin Access
              </div>
            </motion.div>

            <motion.h1 className="al-h1" variants={fadeUp}>Admin Portal</motion.h1>
            <motion.p  className="al-sub" variants={fadeUp}>
              Restricted area. Authorized personnel only.
            </motion.p>

            <motion.form variants={fadeUp} onSubmit={handleLogin}>
              <div className="al-field">
                <label className="al-label">Email address</label>
                <div className="al-input-wrap">
                  <span className="al-input-icon"><Mail size={15} strokeWidth={1.75} /></span>
                  <input
                    className="al-input"
                    type="email"
                    placeholder="admin@helpdesk.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="al-field">
                <label className="al-label">Password</label>
                <div className="al-input-wrap">
                  <span className="al-input-icon"><Lock size={15} strokeWidth={1.75} /></span>
                  <input
                    className="al-input"
                    type={showPw ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    style={{ paddingRight: "2.75rem" }}
                  />
                  <button
                    type="button"
                    className="al-pw-toggle"
                    onClick={() => setShowPw((v) => !v)}
                    tabIndex={-1}
                  >
                    {showPw
                      ? <EyeOff size={15} strokeWidth={1.75} />
                      : <Eye    size={15} strokeWidth={1.75} />}
                  </button>
                </div>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.p
                    className="al-error"
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                  >
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>

              <hr className="al-divider" />

              <motion.button
                className="al-btn"
                type="submit"
                disabled={loading}
                whileHover={{ scale: loading ? 1 : 1.012 }}
                whileTap={{ scale: loading ? 1 : 0.982 }}
                transition={{ type: "spring", stiffness: 400, damping: 22 }}
              >
                {loading
                  ? <><div className="al-spinner" />Authenticating…</>
                  : <>Sign in as Admin <ArrowRight size={16} strokeWidth={2} /></>}
              </motion.button>
            </motion.form>

            <motion.a href="/login" className="al-back" variants={fadeUp}>
              ← Back to user login
            </motion.a>

          </motion.div>
        </motion.div>
      </div>
    </>
  );
}