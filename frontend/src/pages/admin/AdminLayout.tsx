import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { BookOpen, FileText, KeyRound, Type, Users } from "lucide-react";
import AppHeader from "../../components/AppHeader";

type AdminLayoutProps = {
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
};

const NAV_ITEMS = [
  { label: "Typing", to: "/admin/typing", icon: Type },
  { label: "Quiz", to: "/admin/subjects", icon: BookOpen },
  { label: "Attempts", to: "/admin/attempts", icon: FileText },
  { label: "Roles", to: "/admin/roles", icon: KeyRound },
  { label: "Accounts", to: "/admin/accounts", icon: Users },
];

export default function AdminLayout({ title, subtitle, actions, children }: AdminLayoutProps) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "radial-gradient(circle at 15% 10%, #ecfeff 0%, #f8fafc 55%, #ffffff 100%)",
        color: "#0f172a",
        fontFamily: '"Space Grotesk", "IBM Plex Sans", sans-serif',
      }}
    >
      <AppHeader />
      <style>{`
        .admin-wrap {
          max-width: 1200px;
          margin: 28px auto 60px;
          padding: 0 20px 48px;
        }
        .admin-shell {
          display: grid;
          grid-template-columns: 240px 1fr;
          gap: 20px;
          align-items: start;
        }
        @media (max-width: 980px) {
          .admin-shell {
            grid-template-columns: 1fr;
          }
        }
        .admin-sidebar {
          background: #ffffff;
          border-radius: 18px;
          border: 1px solid #e2e8f0;
          padding: 16px;
          box-shadow: 0 12px 24px rgba(15, 23, 42, 0.08);
        }
        .admin-nav {
          display: grid;
          gap: 10px;
        }
        .admin-nav-link {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          border-radius: 12px;
          color: #334155;
          text-decoration: none;
          font-weight: 600;
          border: 1px solid transparent;
          transition: background 180ms ease, border 180ms ease, color 180ms ease;
        }
        .admin-nav-link:hover {
          background: #f1f5f9;
          border-color: #e2e8f0;
          color: #0f172a;
        }
        .admin-nav-link--active {
          background: #0f172a;
          border-color: #0f172a;
          color: #ffffff;
        }
        .admin-content {
          display: grid;
          gap: 18px;
        }
        .admin-header {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }
        .admin-title {
          font-size: clamp(26px, 3vw, 38px);
          margin: 0 0 6px;
        }
        .admin-subtitle {
          margin: 0;
          color: #475569;
        }
        .admin-panel {
          background: #ffffff;
          border-radius: 16px;
          border: 1px solid #e2e8f0;
          padding: 18px 20px;
          box-shadow: 0 12px 24px rgba(15, 23, 42, 0.08);
        }
        .admin-input {
          background: #f8fafc;
          border: 1px solid #cbd5f5;
          border-radius: 12px;
          padding: 10px 12px;
          color: #0f172a;
        }
        .admin-input:focus {
          outline: none;
          border-color: #14b8a6;
          box-shadow: 0 0 0 3px rgba(20, 184, 166, 0.2);
        }
        .admin-button {
          padding: 10px 16px;
          border-radius: 12px;
          border: none;
          font-weight: 600;
          cursor: pointer;
          transition: transform 180ms ease, box-shadow 180ms ease, background 180ms ease;
        }
        .admin-button:hover {
          transform: translateY(-1px);
          box-shadow: 0 8px 18px rgba(15, 23, 42, 0.12);
        }
        .admin-button--primary {
          background: #0f172a;
          color: #ffffff;
        }
        .admin-button--muted {
          background: #f1f5f9;
          color: #334155;
        }
        .admin-button--danger {
          background: #ef4444;
          color: #ffffff;
        }
        .admin-table {
          width: 100%;
          border-collapse: collapse;
        }
        .admin-table th {
          text-align: left;
          font-weight: 600;
          color: #0f172a;
          background: #f1f5f9;
          padding: 12px 16px;
          border-bottom: 1px solid #e2e8f0;
        }
        .admin-table td {
          padding: 12px 16px;
          border-bottom: 1px solid #e2e8f0;
          color: #475569;
          vertical-align: top;
        }
        .admin-table tbody tr:hover {
          background: #f8fafc;
        }
        .admin-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          border-radius: 999px;
          background: #0f172a;
          color: #ffffff;
          font-size: 12px;
          font-weight: 600;
        }
        .admin-tag {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          border-radius: 999px;
          background: #f1f5f9;
          color: #334155;
          font-size: 12px;
          font-weight: 600;
        }
        .admin-modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.45);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          z-index: 50;
        }
        .admin-modal {
          background: #ffffff;
          border-radius: 16px;
          border: 1px solid #e2e8f0;
          padding: 20px;
          width: min(720px, 100%);
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 18px 40px rgba(15, 23, 42, 0.16);
        }
      `}</style>
      <main className="admin-wrap">
        <div className="admin-shell">
          <aside className="admin-sidebar">
            <div className="admin-nav">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `admin-nav-link${isActive ? " admin-nav-link--active" : ""}`
                    }
                  >
                    <Icon size={18} />
                    {item.label}
                  </NavLink>
                );
              })}
            </div>
          </aside>
          <section className="admin-content">
            {title && (
              <div className="admin-header">
                <div>
                  <h1 className="admin-title">{title}</h1>
                  {subtitle && <p className="admin-subtitle">{subtitle}</p>}
                </div>
                {actions && <div>{actions}</div>}
              </div>
            )}
            {children}
          </section>
        </div>
      </main>
    </div>
  );
}
