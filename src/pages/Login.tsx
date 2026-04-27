import { motion } from "framer-motion";
import { ArrowRight, Headphones, ShieldCheck, User } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

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

const stagger = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.08, delayChildren: 0.2 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.42, ease: [0.22, 1, 0.36, 1] } },
};

export default function Login() {
  const { login }             = useAuth();
  const navigate              = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 700));
    login({
      id:    crypto.randomUUID(),
      name:  "User",
      email: "",
      role:  "user",
    });
    navigate("/dashboard");
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@400;500&display=swap');

        html, body, #root { height: 100%; margin: 0; padding: 0; }

        .lx-root {
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
        .lx-root::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: radial-gradient(circle, ${T.border} 1px, transparent 1px);
          background-size: 28px 28px;
          opacity: 0.55;
          pointer-events: none;
        }
        .lx-root::after {
          content: '';
          position: absolute;
          width: 640px;
          height: 640px;
          border-radius: 50%;
          background: radial-gradient(circle, ${T.accentGlow} 0%, transparent 68%);
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          pointer-events: none;
        }
        .lx-card {
          position: relative;
          z-index: 1;
          width: calc(100% - 2.5rem);
          max-width: 400px;
          margin: 0 auto;
          background: ${T.surface};
          border: 1px solid ${T.border};
          border-radius: 22px;
          padding: 2.5rem 2.25rem;
          box-sizing: border-box;
        }
        .lx-logo {
          width: 46px;
          height: 46px;
          border-radius: 13px;
          background: ${T.accentDim};
          border: 1px solid ${T.accent};
          display: flex;
          align-items: center;
          justify-content: center;
          color: ${T.accent};
          margin-bottom: 1.5rem;
        }
        .lx-h1 {
          font-family: 'Playfair Display', serif;
          font-size: 27px;
          font-weight: 700;
          color: ${T.textPrimary};
          margin: 0 0 0.3rem;
          letter-spacing: -0.022em;
          line-height: 1.2;
        }
        .lx-sub {
          font-size: 13.5px;
          color: ${T.textSec};
          margin: 0 0 2rem;
          line-height: 1.5;
        }
        .lx-user-card {
          display: flex;
          align-items: center;
          gap: 0.875rem;
          padding: 0.9rem 1rem;
          border-radius: 13px;
          border: 1px solid ${T.accent};
          background: ${T.accentDim};
          margin-bottom: 1.75rem;
        }
        .lx-user-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: ${T.accentDim};
          color: ${T.accent};
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .lx-role-label { font-size: 14.5px; font-weight: 500; color: ${T.textPrimary}; margin: 0; line-height: 1; }
        .lx-role-desc  { font-size: 12px; color: ${T.textSec}; margin: 4px 0 0; line-height: 1.4; }

        .lx-divider { border: none; border-top: 1px solid ${T.border}; margin: 0 0 1.5rem; }

        .lx-btn {
          all: unset;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          width: 100%;
          padding: 0.875rem 1.25rem;
          border-radius: 13px;
          background: ${T.accent};
          color: #0D0F14;
          font-family: 'DM Sans', sans-serif;
          font-size: 15px;
          font-weight: 500;
          cursor: pointer;
          letter-spacing: 0.01em;
          box-sizing: border-box;
          transition: filter 0.17s;
        }
        .lx-btn:hover:not(:disabled) { filter: brightness(1.09); }
        .lx-btn:disabled { opacity: 0.58; cursor: not-allowed; }

        @keyframes lx-spin { to { transform: rotate(360deg); } }
        .lx-spinner {
          width: 16px; height: 16px;
          border: 2px solid rgba(13,15,20,0.25);
          border-top-color: #0D0F14;
          border-radius: 50%;
          animation: lx-spin 0.7s linear infinite;
          flex-shrink: 0;
        }

        .lx-admin-link {
          all: unset;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          margin-top: 1.25rem;
          font-size: 12.5px;
          color: ${T.textMuted};
          cursor: pointer;
          width: 100%;
          transition: color 0.15s;
          font-family: 'DM Sans', sans-serif;
        }
        .lx-admin-link:hover { color: ${T.textSec}; }
      `}</style>

      <div className="lx-root">
        <motion.div
          className="lx-card"
          initial={{ opacity: 0, y: 28, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.52, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.div variants={stagger} initial="hidden" animate="show">

            <motion.div variants={fadeUp}>
              <div className="lx-logo">
                <Headphones size={22} strokeWidth={1.75} />
              </div>
            </motion.div>

            <motion.h1 className="lx-h1" variants={fadeUp}>Helpdesk Portal</motion.h1>
            <motion.p  className="lx-sub" variants={fadeUp}>
              Welcome! Sign in to submit and track your support tickets.
            </motion.p>

            <motion.div className="lx-user-card" variants={fadeUp}>
              <div className="lx-user-icon">
                <User size={18} strokeWidth={1.75} />
              </div>
              <div style={{ flex: 1 }}>
                <p className="lx-role-label">User Access</p>
                <p className="lx-role-desc">Submit &amp; track support tickets</p>
              </div>
            </motion.div>

            <hr className="lx-divider" />

            <motion.div variants={fadeUp}>
              <motion.button
                className="lx-btn"
                onClick={handleLogin}
                disabled={loading}
                whileHover={{ scale: loading ? 1 : 1.012 }}
                whileTap={{ scale: loading ? 1 : 0.982 }}
                transition={{ type: "spring", stiffness: 400, damping: 22 }}
              >
                {loading ? (
                  <><div className="lx-spinner" />Signing in…</>
                ) : (
                  <>Continue as User <ArrowRight size={16} strokeWidth={2} /></>
                )}
              </motion.button>
            </motion.div>

            <motion.div variants={fadeUp}>
              <button
                className="lx-admin-link"
                onClick={() => navigate("/login/admin")}
              >
                <ShieldCheck size={13} strokeWidth={1.75} />
                Admin? Sign in here
              </button>
            </motion.div>

          </motion.div>
        </motion.div>
      </div>
    </>
  );
}