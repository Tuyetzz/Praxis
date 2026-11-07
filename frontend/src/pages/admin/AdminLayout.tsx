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

/**
 * Shared shell for every /admin page.
 *
 * The `admin-*` classes used by the admin pages and QuestionImportExportModal
 * are defined in src/index.css under @layer components - they must live in a
 * real stylesheet because @apply is resolved at build time and browsers do not
 * understand it. Pages using those classes must render inside this layout.
 */
export default function AdminLayout({ title, subtitle, actions, children }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-surface bg-page text-foreground">
      <AppHeader />

      <main className="admin-wrap">
        <div className="admin-shell">
          <aside className="admin-sidebar">
            <nav className="admin-nav">
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
            </nav>
          </aside>

          <section className="admin-content">
            {title && (
              <div className="admin-header">
                <div>
                  <h1 className="admin-title">{title}</h1>
                  {subtitle && <p className="admin-subtitle">{subtitle}</p>}
                </div>
                {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
              </div>
            )}
            {children}
          </section>
        </div>
      </main>
    </div>
  );
}
