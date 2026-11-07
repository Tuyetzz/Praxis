---
name: add-page
description: Add a new page to the QuizWeb frontend following the existing pattern (API module → type → page component → route), including CRUD screens in the admin area. Use when creating a new screen, adding an admin page, or adding a route for a new feature.
---

# Adding a new page (QuizWeb frontend)

Before writing anything, **read a similar existing page and copy it**:

| Page type | Reference file |
|---|---|
| Student page with fetch + list | `src/pages/quiz/subjects/SubjectsPage.tsx` |
| Page with CRUD + modal + soft delete | `src/pages/admin/AdminSubjectPage.tsx` |
| Complex page (state machine, autosave) | `src/pages/quiz/attempts/AttemptDetailPage.tsx` |
| Admin-area page | `src/pages/admin/AdminChapterPage.tsx` (uses `AdminLayout`) |

Three constraints of this codebase to keep in mind:
- **No react-query** — fetch manually with `useEffect`/`useState`.
- **Relative imports** — the `@/` alias does not work.
- Pages are self-contained and built from the UI kit: use `PageShell` for student pages, `AdminLayout` for admin pages. **Do not add runtime `<style>` blocks** (see the note at the end).

## Checklist

```
- [ ] 1. Add API functions to src/api/<resource>.ts
- [ ] 2. Add/update types in src/types/<resource>.ts
- [ ] 3. Create the page at src/pages/<group>/<Name>Page.tsx (default export)
- [ ] 4. Declare the route in src/app/router/routes.tsx
- [ ] 5. Add a navigation link (AppHeader / Dashboard / AdminLayout sidebar)
- [ ] 6. npm run build && npm run lint
```

## 1. API — `src/api/<resource>.ts`

Keep one file per resource; don't create a new file if one exists. Two response styles:

```ts
// Backend returns the payload directly (subjects, chapters, questions, options, attempts, flashcards...)
export async function getSubjects(): Promise<Subject[]> {
  const res = await http.get("/subjects");
  return res.data;
}

// Backend returns the envelope { success, message, data } (auth, users, roles, permissions, typing*)
// → use the local unwrapData helper already defined in that file
export async function getRoles(): Promise<Role[]> {
  const res = await http.get("/roles");
  return unwrapData<Role[]>(res.data);
}
```

## 2. Type — `src/types/<resource>.ts`

```ts
export interface Post {
  id: string;              // id is always a string
  title: string;
  isDeleted?: boolean;     // present when the backend soft-deletes
  createdAt?: string;
  updatedAt?: string;
}
```

## 3. Page — `src/pages/<group>/<Name>Page.tsx`

Build it from the UI kit and `PageShell` (tokens, no hard-coded colors):

```tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageShell from "../../components/PageShell";
import Card from "../../components/ui/Card";
import Alert from "../../components/ui/Alert";
import Button from "../../components/ui/Button";
import { LoadingState, EmptyState, ErrorState } from "../../components/ui/States";
import { getPosts } from "../../api/posts";
import type { Post } from "../../types/post";

export default function PostsPage() {          // default export — that's how routes.tsx imports it
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      setPosts(await getPosts());
      setError(null);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageShell width="lg" title="Posts" subtitle="Everything you've written.">
      {error && <Alert tone="danger" className="mb-4">{error}</Alert>}
      {loading && <LoadingState label="Loading posts..." />}
      {!loading && posts.length === 0 && (
        <EmptyState title="No posts yet" description="Create your first one to get started." />
      )}
      {!loading && posts.length > 0 && (
        <div className="grid gap-3">
          {posts.map((post) => (
            <Card key={post.id} interactive onClick={() => navigate(`/posts/${post.id}`)}>
              {post.title}
            </Card>
          ))}
        </div>
      )}
    </PageShell>
  );
}

function getErrorMessage(e: unknown) {
  if (typeof e === "object" && e !== null && "response" in e) {
    const res = (e as { response?: { data?: { message?: string } } }).response;
    if (res?.data?.message) return res.data.message;
  }
  return "Something went wrong. Please try again.";
}
```

Always render the three states (loading / empty / error) — don't leave a blank screen. After a mutation (create/update/delete) re-run `loadData()`, or use `const [reloadKey, setReloadKey] = useState(0)` and make the `useEffect` depend on `reloadKey` (the approach `AttemptHistoryPage` uses).

## 4. Admin page

Use `AdminLayout`. The `admin-*` classes are defined in `src/index.css` under `@layer components`, so they follow the theme automatically:

```tsx
import AdminLayout from "./AdminLayout";

return (
  <AdminLayout
    title="Posts"
    subtitle="Manage all posts."
    actions={<button className="admin-button admin-button--primary">Add post</button>}
  >
    <div className="admin-panel">
      {/* table using admin-table, modal using admin-modal / admin-modal-backdrop */}
    </div>
  </AdminLayout>
);
```

**A page or modal using `admin-*` classes must be rendered inside `AdminLayout`** — those styles are what make it look right.

For lists with soft delete: add a `showDeleted` toggle → call the API with `{ includeDeleted: true }`, and render a Restore button for records where `isDeleted`.

## 5. Route — `src/app/router/routes.tsx`

```tsx
<Route element={<ProtectedRoute />}>
  {/* ... */}
  <Route path="/posts" element={<PostsPage />} />
  <Route path="/admin/posts" element={<AdminPostsPage />} />
</Route>
```

Remember the `import PostsPage from "../pages/.../PostsPage";` at the top of the file. Public routes go outside the `ProtectedRoute` branch.

## 6. Navigation

- Student pages: add a link in `src/components/AppHeader.tsx` (`NAV_LINKS`) or a card in `src/pages/dashboard/DashboardPage.tsx`.
- Admin pages: add an entry to the `NAV_ITEMS` array in `src/pages/admin/AdminLayout.tsx`.

## Notes

- **The UI does not enforce permissions**: `ProtectedRoute` only checks login, so anyone can reach `/admin/*` by URL. If an admin page holds sensitive data, it must be locked down on the backend (permission slug).
- If the page needs a backend endpoint that doesn't exist yet → build the backend API first, see the `add-api-endpoint` skill in `backend/.claude/skills/`.
- Don't rename or remove the 3 localStorage keys (`accessToken`, `refreshToken`, `authUser`) — `http.ts` and `AuthProvider` depend on those exact names.
- Copy in the UI is mixed Vietnamese/English; match the group you're adding to (student-facing screens lean Vietnamese, admin screens lean English).
- **Never write `@apply` inside a `<style>` tag in a component.** `@apply` is resolved at build time; in a runtime `<style>` it reaches the browser as-is and does nothing, silently breaking the styling. Shared classes go in `src/index.css` under `@layer components`.
