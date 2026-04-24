import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

const T = {
  bg:      "#0D0F14",
  content: "#0F1118",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <style>{`
        .layout-root {
          display: flex;
          height: 100vh;
          width: 100%;
          overflow: hidden;
          background: ${T.bg};
        }

        /* Sidebar is sticky inside — it handles its own height */

        .layout-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          background: ${T.content};
        }

        /* Navbar is sticky inside layout-main */

        .layout-content {
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
        }

        /* Custom scrollbar */
        .layout-content::-webkit-scrollbar { width: 6px; }
        .layout-content::-webkit-scrollbar-track { background: transparent; }
        .layout-content::-webkit-scrollbar-thumb {
          background: #252932;
          border-radius: 3px;
        }
        .layout-content::-webkit-scrollbar-thumb:hover { background: #333844; }
      `}</style>

      <div className="layout-root">
        <Sidebar />

        <div className="layout-main">
          <Navbar />

          <div className="layout-content">
            {children}
          </div>
        </div>
      </div>
    </>
  );
}