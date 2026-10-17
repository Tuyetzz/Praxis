# Frontend — Architecture & Reference

> File này bổ sung cho `NOTE.md` (bản kế hoạch gốc của tác giả), không thay thế nó.
> `NOTE.md` = ý tưởng/spec ban đầu của từng trang. File này = thực tế code đang chạy, khác gì so với spec, và các điểm cần lưu ý.
> `README.md` vẫn là README mặc định của Vite, không có thông tin dự án.

**Stack:** React 19 · TypeScript 5.9 (strict) · Vite 7 · React Router 7 · axios · TailwindCSS 3.4 · lucide-react.

---

## 1. Chạy & build

```bash
npm run dev       # vite, mặc định http://localhost:5173
npm run build     # tsc -b && vite build
npm run lint      # eslint .
npm run preview
```

Trong Docker: `npm run dev -- --host 0.0.0.0 --port 5173` (xem `Dockerfile`).

> **API base URL đang hard-code** ở `src/api/http.ts` (dòng 31 và 37): `http://localhost:5000/api`.
> Không có `import.meta.env`, không có `.env`, không có proxy trong `vite.config.ts` → dev gọi API cross-origin, phụ thuộc CORS của backend (`app.js` đang chỉ cho `http://localhost:5173`).
> Đổi host API phải sửa **cả hai** literal trong `http.ts`.

`vite.config.ts` chỉ có `plugins: [react()]` — không alias, không proxy, không `envPrefix`. (Alias `@/*` có khai trong `tsconfig.json` nhưng không được kế thừa xuống `tsconfig.app.json` và Vite cũng không biết → **đừng dùng `@/...`, cứ import đường dẫn tương đối**.)

---

## 2. Bootstrap

`src/main.tsx`:

```tsx
<StrictMode>
  <BrowserRouter>
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  </BrowserRouter>
</StrictMode>
```

- Không có `QueryClientProvider`, không error boundary, không theme provider.
- `src/app/App.tsx` là **file rỗng 0 byte**, không được import ở đâu (di sản của cấu trúc trong `NOTE.md`). Đừng thêm gì vào đó — hoặc xoá hẳn.

---

## 3. Auth

### 3.1. `src/app/providers/AuthProvider.tsx`

`useAuth()` trả về `{ user, loading, login, logout }`:

- `login(email, password)` → gọi `POST /auth/login`, lưu token + user, gắn `Authorization` mặc định cho axios.
- `logout()` → gọi `POST /auth/logout` (bọc `try/catch` rỗng, lỗi API bị bỏ qua), xoá localStorage, xoá `user`.
- Khi mount: chỉ đọc `localStorage`, **không gọi `/auth/me`** và không kiểm tra hạn của JWT → `user` có thể cũ cho tới khi có request 401.

### 3.2. localStorage — 3 key không prefix

| Key | Nội dung |
|---|---|
| `accessToken` | JWT thô |
| `refreshToken` | refresh token |
| `authUser` | `JSON.stringify(user)` |

Ngoài ra `TypingPage`/`ParagraphSelectPage` dùng thêm key `selectedTypingText` để truyền đoạn văn đang luyện gõ giữa 2 trang.

### 3.3. `src/api/http.ts`

Hai axios instance (`http` dùng chung, `refreshHttp` chỉ để gọi refresh, không bị interceptor chặn).

**Gắn token 3 lớp**: lúc module load → request interceptor (đọc lại localStorage mỗi request, đây là lớp có hiệu lực) → `AuthProvider.login()` / logic refresh set `http.defaults.headers.common`.

**401 → refresh (single-flight)**:
1. Nếu request đã `_retry` hoặc không phải 401 → reject luôn.
2. Không có refresh token → `clearStoredAuth()` và reject.
3. Nếu đang refresh → xếp request vào `pendingRequests`, refresh xong thì replay với token mới (hoặc reject nếu refresh fail).
4. Refresh thành công → lưu token mới, cập nhật default header, replay request gốc.
5. Refresh fail → `resolvePendingRequests(null)` + `clearStoredAuth()`.

`clearStoredAuth()` xoá 3 key và bắn event `window.dispatchEvent(new Event("auth:invalid"))`; `AuthProvider` lắng nghe event này để set `user = null` → UI tự đăng xuất.

Response refresh được bóc theo cả 2 dạng: `data?.data?.accessToken ?? data?.accessToken`.

**Không có chuẩn hoá error**: page nào cũng phải tự đọc `error.response.data.message` — đoạn code này bị copy nguyên si ở 6 file (`ExamConfigPage`, `AttemptDetailPage`, `AttemptResultPage`, `FlashcardDecksPage`, `FlashcardStudyPage`, `QuestionImportExportModal`).

---

## 4. Routing & phân quyền ở UI

`src/app/router/routes.tsx` — tất cả route protected nằm trong 1 layout route `<ProtectedRoute />`:

| Path | Component | Ghi chú |
|---|---|---|
| `/` | → `/dashboard` | |
| `/login`, `/register` | `auth/LoginPage`, `auth/RegisterPage` | public |
| `/dashboard` | `dashboard/DashboardPage` | |
| `/subjects` | `quiz/subjects/SubjectsPage` | |
| `/subjects/:id/chapters` | `quiz/chapters/ChaptersPage` | |
| `/subjects/:id/chapters/:chapterId/config` | `quiz/exam-config/ExamConfigPage` | màn cấu hình bài thi |
| `/attempts/:id` | `quiz/attempts/AttemptDetailPage` | trang làm bài |
| `/attempts/:id/result` | `quiz/attempts/AttemptResultPage` | |
| `/attempts/history` | `quiz/attempts/AttemptHistoryPage` | |
| `/flashcard-decks`, `/flashcard-decks/:id` | `flashcards/FlashcardDecksPage`, `FlashcardStudyPage` | |
| `/practice/typing` | `typing/TypingPage` | |
| `/practice/select` | `typing/ParagraphSelectPage` | |
| `/practice/typing/ai` | `typing/AiTextPage` | |
| `/practice/typing/history` | `typing/TypingHistoryPage` | |
| `/admin` | → `/admin/typing` | |
| `/admin/typing` | `admin/AdminTypingPage` | |
| `/admin/roles` | `admin/AdminRolePermissionPage` | CRUD role |
| `/admin/roles/:id/permissions` | `admin/AdminRolePermissionsPage` | gán permission cho role |
| `/admin/accounts` | `admin/AdminAccountsPage` | |
| `/admin/attempts` | `admin/AdminAttemptHistoryPage` | |
| `/admin/subjects` | `admin/AdminSubjectPage` | |
| `/admin/subjects/:id/chapters` | `admin/AdminChapterPage` | |
| `/admin/chapters/:id/questions` | `admin/AdminQuestionsPage` | |
| `*` | → `/dashboard` | không có trang 404 |

`ProtectedRoute.tsx` **chỉ kiểm tra đã đăng nhập hay chưa** (`loading` → "Đang kiểm tra phiên đăng nhập…", `!user` → `/login`), **không có check role/permission**.

Chỗ duy nhất check role là `components/AppHeader.tsx` — chỉ để **ẩn link Admin**:

```ts
const isAdmin = Boolean(
  user?.role === "admin" ||
    user?.roles?.some((role) => role === "admin" || role === "superadmin")
);
```

Hệ quả: gõ thẳng `/admin/*` thì user thường vẫn vào được; `DashboardPage` còn render card "Admin Area" **không** kiểm tra gì. **Phân quyền thật nằm ở backend** — UI không thay thế được.

---

## 5. Tầng API (`src/api/`)

Một file / một resource: `http.ts`, `auth.ts`, `users.ts`, `roles.ts`, `permissions.ts`, `subjects.ts`, `chapters.ts`, `questions.ts`, `options.ts`, `attempts.ts`, `attemptsQuestion.ts`, `answer.ts`, `flashcardDecks.ts`, `flashcards.ts`, `typingTexts.ts`, `typingResults.ts`.

**Cách gọi API — fetch thủ công, KHÔNG dùng react-query.**

`@tanstack/react-query` có trong `package.json` nhưng **không được dùng ở bất kỳ đâu**: không `QueryClientProvider`, không `useQuery`/`useMutation`/`queryKey`. Pattern thật của mọi page:

```tsx
useEffect(() => { loadData(); }, [dep]);

async function loadData() {
  setLoading(true);
  try { setData(await apiFn()); }
  catch (e) { /* đọc e.response.data.message */ }
  finally { setLoading(false); }
}
```

Sau khi mutate thì tự gọi lại `loadData()`, hoặc tăng `reloadKey` để chạy lại effect (`AttemptHistoryPage`), hoặc `Promise.all` nhiều lần gọi. **Nếu định dùng react-query thì nên thống nhất lại toàn bộ, đừng trộn nửa nọ nửa kia.**

**Hai kiểu response** (theo backend):
- Trả thẳng `res.data`: `subjects`, `chapters`, `questions`, `options`, `attempts`, `flashcardDecks`, `flashcards`, `attemptsQuestion`, `answer`.
- Bóc envelope `{ success, message, data }`: `auth`, `roles`, `users`, `permissions`, `typingResults`, `typingTexts` — mỗi file tự định nghĩa một `unwrapData` y hệt nhau (6 bản copy, nên gom về `http.ts`).

**Quy ước soft delete**: `DELETE /:resource/:id` = xoá mềm · `PATCH /:resource/:id/restore` = khôi phục · `DELETE /:resource/:id/hard` = xoá vĩnh viễn (attempts, typing-results, typing-texts) · danh sách nhận `{ includeDeleted: true }` cho màn admin.

**Upload**: `questions.ts` → `importQuestionsFromFile` dựng `FormData` (`file`, `subjectId`, `chapterId`, `fileType`) → `POST /questions/import`.

Vài idiom đáng chú ý:
- `roles.ts` gửi body trong DELETE bằng `{ data: { permissionId } }` (đặc thù của axios).
- `attempts.ts` là module đầy đủ nhất: có type cho payload/response (`StartAttemptPayload`, `AttemptGradeResponse`…), phân trang theo shape `{ data, totalItems, totalPages, currentPage, itemsPerPage }`.

---

## 6. Types (`src/types/`)

- `id` là `string` (subject, chapter, question, option, attempt, typing…); `types/answer.ts` và `types/attemptsquestion.ts` còn dùng `number` — **đã lỗi thời** và mâu thuẫn với `selectedOptionIds: string[]` trong `api/attempts.ts`. `User.id` là `string | number`.
- `isDeleted?: boolean` có ở subject/chapter/question/option/role/typingText (phản ánh soft delete của backend).
- `User` mang **cả hai** dạng role: `role?: "student" | "teacher" | "admin"` và `roles?: string[]` — nơi dùng phải xử lý cả hai. `"superadmin"` được check ở `AppHeader` nhưng không có trong type.
- `AttemptSettings.paging` nhận `string | { from, to }` (parse ở `AttemptDetailPage.parsePagingRange`).
- `AttemptQuestion` có `optionOrder` / `pageIndex` nhưng **UI không dùng** → thứ tự option đã shuffle ở backend không được áp dụng khi render.

---

## 7. Pages theo nhóm

Pattern chung: mỗi page tự render `<AppHeader />` và tự nhúng một khối `<style>{...}</style>` với class "toàn cục" (`.panel`, `.attempt-card`, `.primary-button`…). **Không có layout route dùng chung**, nên CSS của page này có thể đè page khác sau khi mount. Tailwind chỉ được dùng thật ở các trang typing; phần còn lại là inline style + `<style>`.

**Quiz**
- `SubjectsPage` → `getSubjects()`, chọn môn.
- `ChaptersPage` → `getChaptersBySubject(id)` + `getSubjectById(id)` để hiện tiêu đề.
- `ExamConfigPage` → `getChapterQuestionCount` để chia cụm câu (`pageSize` 2/10/20/50/100 → `settings.paging = "start-end"`); default `questionsPerPage=10`, `questionTimeSeconds=30`, `durationMinutes=2`, `mode="practice"`; đổi mode thì tự bật/tắt `showAnswerAfterSelect` / `shuffleQuestions`; gọi `startAttempt` rồi chuyển sang `/attempts/:id`. **Còn 1 dòng debug `Output: limit X, offset Y` hiện thẳng trên UI.**
- `AttemptDetailPage` (trang làm bài) → `getAttempt` + `getAttemptQuestions`; state `answersByQuestionId`; chọn đáp án là **autosave ngay** (`saveAttemptAnswer`), fill-blank lưu khi blur; phân trang client-side theo `questionsPerPage`; `readOnly` khi attempt không còn `in_progress`; nếu `showAnswerAfterSelect` thì hiện đáp án đúng trả về từ response.
- `AttemptResultPage` → `getAttemptGrade`, hiện summary + `detailedAnswers`, nút xoá bài (`hardDeleteAttempt`).
- `AttemptHistoryPage` → `getMyAttempts` gọi 3 lần trong `Promise.all` (trang hiện tại + đếm submitted + đếm graded).

**Typing**
- `ParagraphSelectPage` → `getMyTypingTexts` + `getPublicTypingTexts` (tách `isDefault` vs public), CRUD text, chọn bài thì ghi `localStorage.selectedTypingText` rồi sang `/practice/typing`.
- `TypingPage` → engine gõ theo `onKeyDown` (so từng ký tự, đếm `mistakes`, backspace), WPM = `(currentIndex / 5) / phút`, accuracy = `(currentIndex - mistakes) / currentIndex`; xong thì POST `createTypingResult` **1 lần** (có `submitLockRef`); text mặc định local (`local-1..3`) thì **không** lưu kết quả.
- `AiTextPage` → gọi `summarizeTypingText({ baseUrl, text })`, user phải **tự dán URL ngrok**; lưu bằng `createTypingText({ sourceType: "ai_summary" })`. Chế độ "Upload File" (pdf/doc/docx) **mới chỉ lấy tên file, chưa upload/không hoạt động**.
- `TypingHistoryPage` → `getMyTypingResults`, tính WPM/accuracy trung bình, xoá cứng kết quả.

**Flashcards**
- `FlashcardDecksPage` → deck của tôi + deck public (dedupe theo id), CRUD deck.
- `FlashcardStudyPage` → `getFlashcardDeckById` + `getFlashcardsByDeck` (sort theo `order`), click để lật thẻ, prev/next, CRUD card.

**Admin**
- `AdminLayout.tsx` — khung chung: header + sidebar; **toàn bộ class `admin-*` được định nghĩa ở đây**, nên `QuestionImportExportModal` chỉ hiển thị đúng khi nằm trong cây `AdminLayout`.
- `AdminSubjectPage` / `AdminChapterPage` — CRUD + restore, có toggle `showDeleted`.
- `AdminQuestionsPage` — CRUD câu hỏi + option; gọi `getOptionsByQuestion` cho **từng** câu (N+1); tạo bằng `createQuestionWithOptions`; sửa thì đối chiếu option (id tạm `temp-*` → create, id bị bỏ → delete, còn lại → update); chọn True/False thì set cứng 2 option "True"/"False"; chứa nút mở `QuestionImportExportModal`.
- `AdminTypingPage` — CRUD text + restore + hard delete (file này thụt lề bằng tab, các file khác dùng space).
- `AdminRolePermissionPage` (route `/admin/roles`) — CRUD role + restore.
- `AdminRolePermissionsPage` (route `/admin/roles/:id/permissions`) — grid permission theo resource, sort action theo `ACTION_ORDER = ["view","create","update","delete","submit","manage"]`, bật/tắt bằng `assignRolePermission` / `removeRolePermission`.
- `AdminAccountsPage` — list user + gán/gỡ role.
- `AdminAttemptHistoryPage` — giống `AttemptHistoryPage` nhưng dùng `getAllAttempts`; bảng chỉ hiện `userId` thô, không join tên user.

---

## 8. Components dùng chung

| File | Vai trò |
|---|---|
| `AppHeader.tsx` | Header + nav (Dashboard / Quiz / Quiz history / Flashcards / Typing / Admin). Không có prop, không highlight route đang mở. |
| `QuestionImportExportModal.tsx` | Modal import câu hỏi (`isOpen`, `subjectId`, `chapterId`, `onClose`, `onImported`). Chọn `fileType` kahoot/quizizz, gọi `importQuestionsFromFile`, hiện `Imported X/Y. Failed: N.`; phần Export chỉ có 2 link tải template + nút `Export data (coming soon)` **bị disable**. Chỉ `AdminQuestionsPage` dùng. |

---

## 9. Đối chiếu với `NOTE.md` (spec gốc)

**Đã làm:** login/register, dashboard, CRUD subject/chapter/question + import Kahoot/Quizizz, exam config, trang làm bài, trang kết quả, flashcard deck + study, typing (chọn text, gõ, lịch sử), admin (role/permission, accounts, attempts, typing).

**Chưa làm / khác spec:**

| Trong `NOTE.md` | Thực tế |
|---|---|
| `pages/error/` (404, 403), `hooks/`, `utils/`, `styles/`, `layouts/` | Chưa tồn tại; route lạ redirect về `/dashboard` |
| Trang ForgotPassword | Chưa có |
| Bảng xếp hạng ở trang chính | Chưa có (BE chưa có API) |
| Trang thống kê admin | Chưa có |
| Kiểu hiển thị "trả lời tuần tự" vs "hiện toàn bộ" | Chỉ còn paging theo cụm câu |
| Thời gian tự động chuyển câu, xem trước câu hỏi | Chưa có |
| Đếm ngược thời gian khi làm bài | Backend có trả `expiresAt`/`questionTimeSeconds` nhưng UI **không hiển thị đồng hồ** |
| Trang gen text AI: upload pdf/word | Mới là stub, phải dán URL ngrok thủ công |
| Flashcard `nextReview` (spaced repetition) | Có field, không có logic |

---

## 10. Điểm cần lưu ý / nợ kỹ thuật

**Bug đã xác nhận**
- `AdminQuestionsPage.tsx:521,543,547` so sánh `formData.type !== "trueFalse"` trong khi giá trị thật là `"true_false"` → nhánh True/False không bao giờ chạy (nút "Add Option", disable ô nhập, nút xoá option).
- `AdminQuestionsPage.getQuestionTypeLabel` (dòng 299) thiếu case `"fill_blank"` → trả `undefined`; đồng thời form admin không cho tạo câu `fill_blank` dù trang làm bài đã hỗ trợ.
- `DashboardPage` luôn hiện card "Admin Area" cho mọi user (không check role).
- Không có route guard theo role → `/admin/*` truy cập được bằng URL trực tiếp.

**Nợ kỹ thuật**
- `src/app/App.tsx` rỗng 0 byte, không dùng.
- `@tanstack/react-query` cài nhưng không dùng (xem §5).
- `api/answer.ts` không được import ở đâu; các hàm chết: `getAllQuestions`, `getQuestionById`, `createQuestion`, `batchCreateQuestions`, `getOptionById`, `getFlashcardById`, `getTypingText`, `addAttemptQuestion`, `updateAttemptQuestion`, `deleteAttemptQuestion`.
- `unwrapData` copy 6 lần; đoạn bắt `error.response.data.message` copy 6 lần; logic 2 trang history trùng nhau; UI CRUD typing text trùng giữa `ParagraphSelectPage` và `AdminTypingPage`.
- CSS: nhiều page định nghĩa trùng class trong `<style>` riêng → style rò rỉ toàn cục.
- `index.html` vẫn để title `Vite + React + TS` và favicon `/vite.svg`; font `"Space Grotesk"`/`"IBM Plex Sans"` được khai trong inline style nhưng **chưa bao giờ được load**.
- Không có test, không có CI.
- Copy lẫn lộn Việt/Anh, riêng 2 trang attempt history viết tiếng Việt **không dấu**.
- `alert()`/`confirm()` dùng cho validate và xoá ở hầu hết trang admin.
