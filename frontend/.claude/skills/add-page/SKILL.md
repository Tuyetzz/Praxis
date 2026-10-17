---
name: add-page
description: Thêm một trang mới cho frontend QuizWeb theo đúng pattern hiện có (API module → type → page component → route), gồm cả trang CRUD trong khu admin. Dùng khi cần tạo màn hình mới, thêm trang admin, hoặc thêm route cho tính năng mới.
---

# Thêm một trang mới (frontend QuizWeb)

Trước khi viết, **đọc một trang tương tự đã có và bắt chước**:

| Loại trang | File mẫu |
|---|---|
| Trang học sinh, có fetch + list | `src/pages/quiz/subjects/SubjectsPage.tsx` |
| Trang có CRUD + modal + soft delete | `src/pages/admin/AdminSubjectPage.tsx` |
| Trang phức tạp (state máy trạng thái, autosave) | `src/pages/quiz/attempts/AttemptDetailPage.tsx` |
| Trang trong khu admin | `src/pages/admin/AdminChapterPage.tsx` (dùng `AdminLayout`) |

Nhắc lại 3 ràng buộc của codebase:
- **Không dùng react-query** — fetch thủ công bằng `useEffect`/`useState`.
- Import **đường dẫn tương đối**, không dùng `@/`.
- Page tự chứa: tự render `<AppHeader />`, tự nhúng `<style>`; trang admin dùng `AdminLayout`.

## Checklist

```
- [ ] 1. Thêm hàm API vào src/api/<resource>.ts
- [ ] 2. Thêm/sửa type trong src/types/<resource>.ts
- [ ] 3. Tạo page trong src/pages/<nhóm>/<Tên>Page.tsx (default export)
- [ ] 4. Khai route trong src/app/router/routes.tsx
- [ ] 5. Thêm link điều hướng (AppHeader / Dashboard / sidebar AdminLayout)
- [ ] 6. npm run build && npm run lint
```

## 1. API — `src/api/<resource>.ts`

Giữ đúng file theo resource, không tạo file mới nếu đã có. Hai kiểu response:

```ts
// Backend trả thẳng payload (subjects, chapters, questions, options, attempts, flashcards...)
export async function getSubjects(): Promise<Subject[]> {
  const res = await http.get("/subjects");
  return res.data;
}

// Backend trả envelope { success, message, data } (auth, users, roles, permissions, typing*)
// → dùng helper unwrapData cục bộ đã có sẵn trong file đó
export async function getRoles(): Promise<Role[]> {
  const res = await http.get("/roles");
  return unwrapData<Role[]>(res.data);
}
```

## 2. Type — `src/types/<resource>.ts`

```ts
export interface Post {
  id: string;              // id luôn là string
  title: string;
  isDeleted?: boolean;     // có nếu backend xoá mềm
  createdAt?: string;
  updatedAt?: string;
}
```

## 3. Page — `src/pages/<nhóm>/<Tên>Page.tsx`

```tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppHeader from "../../components/AppHeader";
import { getPosts } from "../../api/posts";
import type { Post } from "../../types/post";

export default function PostsPage() {          // default export — routes.tsx import kiểu này
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      setPosts(await getPosts());
      setError("");
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <AppHeader />
      <main style={{ maxWidth: 1100, margin: "0 auto", padding: 24 }}>
        {loading && <p>Đang tải...</p>}
        {error && <p style={{ color: "#dc2626" }}>{error}</p>}
        {posts.map((post) => (
          <div key={post.id} className="panel" onClick={() => navigate(`/posts/${post.id}`)}>
            {post.title}
          </div>
        ))}
      </main>
      <style>{`
        .panel { background: #fff; border-radius: 12px; padding: 16px; margin-bottom: 12px; }
      `}</style>
    </>
  );
}

function getErrorMessage(e: unknown) {
  if (typeof e === "object" && e !== null && "response" in e) {
    const res = (e as { response?: { data?: { message?: string } } }).response;
    if (res?.data?.message) return res.data.message;
  }
  return "Có lỗi xảy ra, thử lại sau.";
}
```

Sau khi mutate (tạo/sửa/xoá) thì gọi lại `loadData()` — hoặc dùng `const [reloadKey, setReloadKey] = useState(0)` và cho `useEffect` phụ thuộc `reloadKey` (cách `AttemptHistoryPage` đang làm).

## 4. Trang admin

Dùng `AdminLayout` (nhớ: mọi class `admin-*` chỉ có ở đó):

```tsx
import AdminLayout from "./AdminLayout";

return (
  <AdminLayout
    title="Posts"
    subtitle="Quản lý bài viết"
    actions={<button className="admin-btn" onClick={openCreate}>Thêm</button>}
  >
    {/* bảng + modal, dùng class admin-table / admin-modal / admin-btn */}
  </AdminLayout>
);
```

Với danh sách có xoá mềm: thêm toggle `showDeleted` → gọi API với `{ includeDeleted: true }`, và render nút Restore cho bản ghi `isDeleted`.

## 5. Route — `src/app/router/routes.tsx`

```tsx
<Route element={<ProtectedRoute />}>
  {/* ... */}
  <Route path="/posts" element={<PostsPage />} />
  <Route path="/admin/posts" element={<AdminPostsPage />} />
</Route>
```

Nhớ `import PostsPage from "../pages/.../PostsPage";` ở đầu file. Route public thì đặt ngoài nhánh `ProtectedRoute`.

## 6. Điều hướng

- Trang học sinh: thêm link ở `src/components/AppHeader.tsx` (nav chính) hoặc card trong `src/pages/dashboard/DashboardPage.tsx`.
- Trang admin: thêm vào mảng `NAV_ITEMS` trong `src/pages/admin/AdminLayout.tsx`.

## Lưu ý

- **UI không phân quyền**: `ProtectedRoute` chỉ kiểm tra đăng nhập, `/admin/*` ai gõ URL cũng vào được. Nếu trang admin cần bảo vệ thật thì phải siết ở backend (permission slug).
- Nếu trang cần gọi API mới của backend mà chưa có → viết API backend trước, xem skill `add-api-endpoint` bên `backend/.claude/skills/`.
- Đừng đổi 3 key localStorage (`accessToken`, `refreshToken`, `authUser`) — `http.ts` và `AuthProvider` phụ thuộc vào đúng tên này.
- Copy trong UI đang trộn Việt/Anh; theo ngôn ngữ của nhóm trang bạn đang thêm vào (trang học sinh thường tiếng Việt, trang admin thường tiếng Anh).
