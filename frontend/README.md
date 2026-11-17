# Frontend — Praxis

React 19 · TypeScript (strict) · Vite 7 · React Router 7 · axios · TailwindCSS 3 · lucide-react.

```bash
npm run dev      # http://localhost:5173
npm run build    # tsc -b && vite build
npm run lint     # eslint .
```

## API base URL

Set at **build time** via `VITE_API_URL` (Vite inlines `VITE_*` into the bundle):

| Context | Value | Effect |
|---|---|---|
| Local dev | unset | Falls back to `http://localhost:5000/api` |
| Production | `/api` | Same origin; nginx proxies `/api` to the backend, so **no CORS** |

See `src/api/http.ts`. Because it is baked in at build time, changing it
requires a rebuild.

## Layout

```
src/
├── api/          # One file per resource; axios calls live here
├── app/          # Router, providers (Auth, Theme)
├── components/   # AppHeader, PageShell, and the ui/ kit
│   └── ui/       # Button, Card, Field, Modal, Table, Badge, Alert, States
├── pages/        # Grouped by feature: auth, dashboard, quiz, typing, flashcards, admin
└── types/        # Shared TypeScript types
```

## Conventions

- **No react-query.** Every page fetches manually with `useEffect` + `useState`
  and updates local state after a mutation rather than refetching everything.
- **Relative imports.** The `@/` alias in `tsconfig.json` has no effect.
- **Design tokens, not hex colors.** Semantic colors (`surface`, `border`,
  `foreground`, `muted`, `primary`, …) live in `tailwind.config.js` and are
  driven by CSS variables in `src/index.css`, so they follow the theme.
- **Use `PageShell`** for the page frame and the `ui/` kit for controls, rather
  than hand-rolling markup.
- **Never put `@apply` in a runtime `<style>` tag.** It is resolved at build
  time; in a `<style>` tag it reaches the browser inert and silently breaks
  styling. Shared classes belong in `src/index.css` under `@layer components` —
  that is where the `admin-*` classes live.
- Pages using `admin-*` classes must render inside `AdminLayout`, otherwise that
  markup is unstyled.

## Notes

- **The UI does not enforce permissions.** `ProtectedRoute` only checks that you
  are logged in, and `/admin/*` is reachable by typing the URL. The backend is
  the authority.
- Auth state lives in `localStorage` under `accessToken`, `refreshToken` and
  `authUser`. Don't rename them — `http.ts` and `AuthProvider` depend on them.
- `src/app/App.tsx` is an empty, unused file.

Fuller documentation: [ARCHITECTURE.md](ARCHITECTURE.md), and [NOTE.md](NOTE.md)
for the original feature spec.
