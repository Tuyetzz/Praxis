import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { GraduationCap, LogOut, Menu, X } from "lucide-react";
import { useAuth } from "../app/providers/AuthProvider";
import ThemeToggle from "./ui/ThemeToggle";
import Button from "./ui/Button";

const NAV_LINKS = [
  { label: "Dashboard", to: "/dashboard" },
  { label: "Quizzes", to: "/subjects" },
  { label: "AI Questions", to: "/ai/quiz" },
  { label: "History", to: "/attempts/history" },
  { label: "Flashcards", to: "/flashcard-decks" },
  { label: "Typing", to: "/practice/select" },
];

export default function AppHeader() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const isAdmin = Boolean(
    user?.role === "admin" ||
      user?.roles?.some((role) => role === "admin" || role === "superadmin")
  );

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    [
      "rounded-control px-3 py-1.5 text-sm font-medium transition-colors duration-150",
      isActive
        ? "bg-primary-soft text-primary"
        : "text-muted hover:bg-surface-sunken hover:text-foreground",
    ].join(" ");

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface-raised/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-1">
          <Link
            to={user ? "/dashboard" : "/login"}
            className="mr-2 flex items-center gap-2 rounded-control px-1 py-1 font-bold text-foreground transition-opacity hover:opacity-80"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-control bg-primary text-primary-fg">
              <GraduationCap size={18} />
            </span>
            <span className="hidden sm:inline">QuizWeb</span>
          </Link>

          {user && (
            <nav className="hidden items-center gap-0.5 md:flex">
              {NAV_LINKS.map((link) => (
                <NavLink key={link.to} to={link.to} className={linkClass}>
                  {link.label}
                </NavLink>
              ))}
              {isAdmin && (
                <NavLink to="/admin/subjects" className={linkClass}>
                  Admin
                </NavLink>
              )}
            </nav>
          )}
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />

          {!user && (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="rounded-control px-3 py-1.5 text-sm font-medium text-muted transition-colors hover:bg-surface-sunken hover:text-foreground"
              >
                Sign in
              </Link>
              <Link to="/register">
                <Button size="sm">Sign up</Button>
              </Link>
            </div>
          )}

          {user && (
            <>
              <span className="hidden max-w-[12rem] truncate text-sm text-muted sm:inline">
                {user.name}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                icon={<LogOut size={15} />}
                className="hidden sm:inline-flex"
              >
                Sign out
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMenuOpen((open) => !open)}
                aria-label={menuOpen ? "Close menu" : "Open menu"}
                aria-expanded={menuOpen}
                className="!px-2 md:hidden"
              >
                {menuOpen ? <X size={18} /> : <Menu size={18} />}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Mobile nav */}
      {user && menuOpen && (
        <nav className="border-t border-border bg-surface-raised px-4 py-3 md:hidden">
          <div className="grid gap-1">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={linkClass}
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </NavLink>
            ))}
            {isAdmin && (
              <NavLink to="/admin/subjects" className={linkClass} onClick={() => setMenuOpen(false)}>
                Admin
              </NavLink>
            )}
            <div className="mt-2 flex items-center justify-between border-t border-border pt-3">
              <span className="truncate text-sm text-muted">{user.name}</span>
              <Button variant="ghost" size="sm" onClick={handleLogout} icon={<LogOut size={15} />}>
                Sign out
              </Button>
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}
