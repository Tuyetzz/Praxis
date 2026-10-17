# Frontend — QuizWeb

SPA cho app luyện thi trắc nghiệm (quiz + flashcard + typing).
React 19 · TypeScript strict · Vite 7 · React Router 7 · axios · TailwindCSS 3 · lucide-react.

Tài liệu liên quan:
- `NOTE.md` — spec/kế hoạch gốc của tác giả (nhiều mục chưa làm, xem §9 của file dưới).
- `ARCHITECTURE.md` — bản đồ code thực tế: routing, auth flow, từng page, bug đã biết, nợ kỹ thuật.

## Lệnh

```bash
npm run dev      # http://localhost:5173
npm run build    # tsc -b && vite build
npm run lint     # eslint .
```

## Sự thật quan trọng nhất về codebase này

1. **KHÔNG dùng react-query.** `@tanstack/react-query` có trong `package.json` nhưng không được dùng ở đâu cả. Mọi page fetch thủ công bằng `useEffect` + `useState` + `await apiFn()`, sau khi mutate thì tự gọi lại hàm load hoặc tăng `reloadKey`. Xem §5 của `ARCHITECTURE.md` để biết pattern chính xác — **đừng tự ý thêm `useQuery` vào giữa** khi chưa thống nhất cả app.
2. **API base URL hard-code** tại `src/api/http.ts` (2 chỗ: `http` và `refreshHttp`) = `http://localhost:5000/api`. Không có env var, không có proxy Vite.
3. **Auth nằm ở localStorage** với 3 key: `accessToken`, `refreshToken`, `authUser`. Logic refresh 401 (single-flight) ở `http.ts`; `AuthProvider` nghe event `auth:invalid` để tự logout.
4. **UI không phân quyền.** `ProtectedRoute` chỉ kiểm tra đã đăng nhập; `AppHeader` chỉ ẩn link Admin. `/admin/*` vẫn vào được bằng URL trực tiếp — **đừng tin UI để bảo vệ dữ liệu, quyền thật do backend quyết**.
5. **`src/app/App.tsx` là file rỗng**, không được import. Đừng thêm gì vào đó.
6. Không có `import.meta.env`, không `.env`, không alias `@/` (alias trong `tsconfig.json` không có tác dụng) → **dùng đường dẫn tương đối**.

## Quy ước viết code

- **1 page = 1 file tự chứa** trong `src/pages/<nhóm>/`: tự render `<AppHeader />`, tự nhúng `<style>{...}</style>` + inline style. Không có layout dùng chung (trừ admin dùng `AdminLayout`).
- Class CSS `admin-*` **chỉ được định nghĩa trong `pages/admin/AdminLayout.tsx`** — page/modal nào dùng class đó phải nằm trong cây `AdminLayout`.
- API: thêm hàm mới vào đúng file trong `src/api/`. Module nào backend trả envelope `{ success, message, data }` (auth, users, roles, permissions, typingResults, typingTexts) thì bóc qua helper `unwrapData` cục bộ của file; các module khác trả thẳng `res.data`.
- Type để trong `src/types/`, `id` là `string`. Cẩn thận `types/answer.ts` và `types/attemptsquestion.ts` còn dùng `id: number` — **đã lỗi thời**, đừng copy style đó.
- Thêm route mới → khai trong `src/app/router/routes.tsx`, đặt trong nhánh `<Route element={<ProtectedRoute />}>` nếu cần đăng nhập.
- Xoá dữ liệu: `DELETE /:id` là xoá mềm, `PATCH /:id/restore` để khôi phục, `DELETE /:id/hard` là xoá vĩnh viễn; màn admin dùng `{ includeDeleted: true }`.
- Comment và copy trong code trộn Việt/Anh — giữ nguyên văn phong của file đang sửa, đừng "chuẩn hoá" hàng loạt.

## Bản đồ file

| Cần gì | Ở đâu |
|---|---|
| Axios instance, gắn token, refresh 401 | `src/api/http.ts` |
| Gọi API theo resource | `src/api/*.ts` |
| Auth state, login/logout | `src/app/providers/AuthProvider.tsx` |
| Khai báo route | `src/app/router/routes.tsx`, `ProtectedRoute.tsx` |
| Trang theo tính năng | `src/pages/{auth,dashboard,quiz,typing,flashcards,admin}/` |
| Component dùng chung | `src/components/` (`AppHeader`, `QuestionImportExportModal`) |
| Type dùng chung | `src/types/` |
| Khung + CSS của admin | `src/pages/admin/AdminLayout.tsx` |

## Trước khi sửa

Đọc file tương tự đã có rồi bắt chước (ví dụ thêm trang CRUD mới thì xem `AdminSubjectPage.tsx`, thêm trang học sinh thì xem `SubjectsPage.tsx` / `AttemptHistoryPage.tsx`).

Skill `add-page` (`.claude/skills/add-page/`) có checklist từng bước khi thêm một trang mới.
