# Frontend — Praxis

SPA for the quiz practice app (quiz + flashcards + typing).
React 19 · TypeScript strict · Vite 7 · React Router 7 · axios · TailwindCSS 3 · lucide-react.

Related docs:
- `NOTE.md` — the author's original spec/plan (several items are still unbuilt; see §9 of the file below).
- `ARCHITECTURE.md` — map of the actual code: routing, auth flow, each page, known bugs, tech debt.

## Commands

```bash
npm run dev      # http://localhost:5173
npm run build    # tsc -b && vite build
npm run lint     # eslint .
```

## The most important facts about this codebase

1. **react-query is NOT used.** `@tanstack/react-query` is in `package.json` but used nowhere. Every page fetches manually with `useEffect` + `useState` + `await apiFn()`, and re-fetches after a mutation by calling the load function again or bumping a `reloadKey`. See §5 of `ARCHITECTURE.md` for the exact pattern — **don't drop `useQuery` into one page** unless the whole app is converted deliberately.
2. **The API base URL is hard-coded** in `src/api/http.ts` (two places: `http` and `refreshHttp`) as `http://localhost:5000/api`. No env var, no Vite proxy.
3. **Auth lives in localStorage** under 3 keys: `accessToken`, `refreshToken`, `authUser`. The 401 refresh (single-flight) logic is in `http.ts`; `AuthProvider` listens for the `auth:invalid` event to log out.
4. **The UI does not enforce permissions.** `ProtectedRoute` only checks that you're logged in; `AppHeader` only hides the Admin link. `/admin/*` is reachable by typing the URL — **never rely on the UI to protect data; the backend decides real permissions.**
5. **`src/app/App.tsx` is an empty file** (0 bytes) and is not imported anywhere. Don't add anything to it.
6. No `import.meta.env`, no `.env`, no `@/` alias (the alias in `tsconfig.json` has no effect) → **use relative paths**.

## Design system (added in the redesign — follow it)

- **Design tokens** live in `tailwind.config.js` (semantic colors: `surface`, `border`, `foreground`, `muted`, `primary`, `success`/`warning`/`danger`, plus `rounded-card`/`rounded-control` and `shadow-card`/`shadow-lift`/`shadow-pop`). They are driven by CSS variables defined in `src/index.css` for `:root` and `.dark`, so they follow the theme automatically — **use these instead of hard-coded hex colors**.
- **Dark mode** is `class`-based: `ThemeProvider` (`src/app/providers/ThemeProvider.tsx`, context in `themeContext.ts`) toggles `.dark` on `<html>`, persists to `localStorage.theme`, and `index.html` has a pre-paint script to avoid a flash. Toggle UI is `ui/ThemeToggle`.
- **Shared UI kit** in `src/components/ui/`: `Button`, `Card`, `Field` (+ `Input`/`Select`/`Textarea`/`Checkbox`/`Radio`), `Modal`, `Table`, `Badge`, `Alert`, `States` (loading/empty/error), `ThemeToggle`.
- **`PageShell`** (`src/components/PageShell.tsx`) is the standard page frame (backdrop + `AppHeader` + max-width + title/subtitle/actions). Use it instead of hand-rolling the wrapper.
- **Never put `@apply` in a runtime `<style>` tag.** `@apply` is resolved at *build time*; shipping it to the browser does nothing (browsers have no `@apply`) and the styles silently break. Global/shared classes belong in `src/index.css` under `@layer components` — that's where the `admin-*` classes live.
- There are **no runtime `<style>` blocks left**; don't reintroduce them.

## Code conventions

- **Pages are self-contained** in `src/pages/<group>/`: they render `PageShell` (or `AdminLayout` in the admin area) and use the UI kit. Prefer kit components and token classes over inline `style={{}}`.
- The `admin-*` CSS classes are **defined in `src/index.css`** (under `@layer components`) and *used* by the admin pages and `QuestionImportExportModal`. A page or modal using those classes **must render inside `AdminLayout`**, otherwise the markup is unstyled.
- API: add new functions to the right file in `src/api/`. Modules whose backend returns the envelope `{ success, message, data }` (auth, users, roles, permissions, typingResults, typingTexts) unwrap it with that file's local `unwrapData` helper; the rest return `res.data` directly.
- Types live in `src/types/`, and `id` is a `string`. Watch out: `types/answer.ts` and `types/attemptsquestion.ts` still use `id: number` — **outdated**, don't copy that style.
- New route → declare it in `src/app/router/routes.tsx`, inside the `<Route element={<ProtectedRoute />}>` branch if it requires login.
- Deleting data: `DELETE /:id` is a soft delete, `PATCH /:id/restore` restores, `DELETE /:id/hard` is permanent; admin screens pass `{ includeDeleted: true }`.
- Comments and copy in the code are a mix of Vietnamese and English — keep the style of the file you're editing rather than normalizing in bulk.

## File map

| What you need | Where |
|---|---|
| Axios instance, token attachment, 401 refresh | `src/api/http.ts` |
| Per-resource API calls | `src/api/*.ts` |
| Auth state, login/logout | `src/app/providers/AuthProvider.tsx` |
| Theme (light/dark) state | `src/app/providers/ThemeProvider.tsx`, `themeContext.ts` |
| Route declarations | `src/app/router/routes.tsx`, `ProtectedRoute.tsx` |
| Feature pages | `src/pages/{auth,dashboard,quiz,typing,flashcards,admin}/` |
| Shared components | `src/components/` (`AppHeader`, `PageShell`) |
| UI kit primitives | `src/components/ui/` |
| Design tokens | `tailwind.config.js`, `src/index.css` |
| Admin shell + `admin-*` class definitions | `AdminLayout.tsx` (usage), `src/index.css` (definitions) |
| Shared types | `src/types/` |

## Before you edit

Read a similar existing page and copy it (e.g. for a new CRUD screen look at `AdminSubjectPage.tsx`; for a student-facing screen look at `SubjectsPage.tsx` / `AttemptHistoryPage.tsx`).

The `add-page` skill (`.claude/skills/add-page/`) has a step-by-step checklist for adding a new page.
