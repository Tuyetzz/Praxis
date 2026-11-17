# TODO — Praxis

> Cập nhật: 2026-10-15

---

## 1. ~~Bug: Trộn thứ tự câu hỏi bị mất~~ ✅ ĐÃ SỬA (2026-10-17)

**Nguyên nhân gốc**: bảng `attempt_questions` **không có cột nào lưu thứ tự câu**. `StartAttempt` chỉ lưu `pageIndex`, nên thứ tự sau khi xáo trộn trong cùng một trang không thể phục hồi được; `GetAttemptQuestions` bù bằng cách sort theo `questionId` (UUID → thứ tự ngẫu nhiên).

**Đã sửa** — thêm cột `sequence` (INT, 0-based) giữ vị trí câu trong lượt làm bài:

```sql
-- Đã chạy trên examdb (2026-10-17). Project chưa có migration nên phải chạy tay:
ALTER TABLE attempt_questions ADD COLUMN sequence INT NOT NULL DEFAULT 0 AFTER pageIndex;
CREATE INDEX attempt_questions_attemptId_sequence ON attempt_questions (attemptId, sequence);
```

- `StartAttempt.js` — ghi `sequence: index` khi tạo attempt_questions
- `GetAttemptQuestions.js` — sort theo `pageIndex` → `sequence` (fallback `questionId` cho dữ liệu cũ)
- `AttemptQuestionRepository.findByAttempt` — `ORDER BY sequence, pageIndex` (sửa luôn thứ tự `detailedAnswers` của `GetAttemptGrade`)
- `AttemptQuestion` entity + `AttemptQuestionModel` + ERD `model.txt` — thêm field

**Lưu ý**: attempt tạo **trước** khi sửa vẫn giữ thứ tự cũ (thứ tự gốc chưa từng được lưu → không phục hồi được). Attempt mới thì đúng.

---

## 2. AI Autogen Quiz (NotebookLM style)

### Câu hỏi: Call API hay train model + ngrok?

| Tiêu chí | Call API sẵn (OpenAI, Claude, Gemini…) | Train custom model + ngrok |
|---|---|---|
| **Độ khó implement** | Thấp: thêm 1 endpoint proxy, dùng prompt engineering | Cao: cần dataset, GPU, MLOps, deploy, monitoring |
| **Chất lượng output** | Tốt ngay lập tức (model SOTA) | Phụ thuộc data + compute; cold-start kém |
| **Chi phí** | Pay-per-token (dễ dự đoán) | GPU Colab free có limit; VPS GPU tốn tiền |
| **Tùy biến domain** | Prompt + few-shot + RAG (context từ question bank) | Fine-tune trên data Praxis (cần data sạch) |
| **Latency** | ~1-3s | Tùy infra; ngrok thêm overhead |
| **Bảo mật dữ liệu** | Data đi ra ngoài (cần DPA) | Giữ local (nếu self-host) |
| **Maintenance** | Nhà cung cấp lo | Tự lo model drift, retrain, scaling |

### Khuyến nghị: **Bắt đầu bằng Call API**

1. Thêm `POST /api/ai/generate-quiz` (hoặc `/api/questions/generate`) nhận `{ subjectId, chapterId, topic, numQuestions, difficulty, questionTypes[], contextText? }`
2. Dùng RAG: retrieve câu hỏi ähn từ `questions` table → few-shot prompt → generate mới
3. Trả về format batch (`mode: "all-or-nothing"`, items có `text, options[]…`) → FE gọi `POST /api/questions/batch` để lưu
4. Sau khi có data sinh ra sẵn (vài nghìn câu) thì cân nhắc fine-tune nhỏ (LoRA) nếu cần latency thấp hơn / offline.

### Cần thêm gì ở backend

- [ ] `usecases/ai/GenerateQuiz.js` (gọi LLM API, parse JSON, validate)
- [ ] `interfaces/controllers/AIController.js`
- [ ] `interfaces/routes/aiRoutes.js` + mount vào `routes/index.js`
- [ ] Permission slug: `ai:generate_quiz` (thêm vào `domain/constants/permissions.js` → `seed:system`)
- [ ] Config env: `LLM_PROVIDER`, `LLM_API_KEY`, `LLM_MODEL`, `LLM_BASE_URL` (mặc định OpenAI-compatible)
- [ ] Rate limit riêng cho AI endpoint (tránh spam token)
- [ ] Logging prompt/response để debug &_eval

### Không cần controller mới phức tạp

- 1 controller method `generateQuiz(req, res)` gọi usecase → trả batch format.
- FE: trang "AI Generate" nhập chủ đề → gọi API → hiện preview → user bấm "Lưu vào chapter" → gọi `batchCreateQuestions`.

### ✅ FE đã xong (2026-10-17) — backend cần khớp contract này

Trang: `frontend/src/pages/quiz/ai/AiQuizPage.tsx` · route `/ai/quiz` · API client `frontend/src/api/ai.ts`

**Endpoint FE đang gọi:** `POST /api/ai/generate-quiz` (cần auth + permission slug `ai:generate_quiz`; **mọi user đều được dùng**, không giới hạn theo role)

Request:
```json
{
  "topic": "chuỗi chủ đề HOẶC văn bản nguồn user dán vào",
  "numQuestions": 10,
  "subjectId": "uuid",
  "chapterId": "uuid",
  "questionTypes": ["single", "multiple", "true_false", "fill_blank"],
  "difficulty": 2,
  "language": "english"
}
```

Response mong đợi:
```json
{
  "questions": [
    {
      "text": "Nội dung câu hỏi",
      "type": "single",
      "explanation": "Giải thích (optional)",
      "difficulty": 2,
      "points": 1,
      "options": [
        { "text": "Đáp án đúng", "isCorrect": true, "order": 1 },
        { "text": "Nhiễu", "isCorrect": false, "order": 2 }
      ]
    }
  ],
  "model": "optional-ten-model-id",
  "usage": { "promptTokens": 0, "completionTokens": 0 }
}
```

**Lưu ý quan trọng:**
- `type` phải là 1 trong `single | multiple | true_false | fill_blank` (đúng như `questions_type_enum` của BE). Nếu LLM trả sai → validate & map lại trong `GenerateQuiz.js`.
- `fill_blank`: đáp án đúng nằm ở `options[].text` với `isCorrect: true` (đúng như `SubmitAttempt.gradeFillBlank` đang chấm).
- Endpoint **không** tự lưu DB — chỉ sinh và trả về. FE preview rồi gọi `POST /api/questions/batch` để lưu (đã sửa `batchCreateQuestions` cho khớp format `{ mode, subjectId, chapterId, type, items }`).
- **Trong lúc chưa có BE**: FE tự fallback sang câu hỏi mẫu khi gặp **404/501** và hiện banner cảnh báo — luồng preview/chọn/lưu vẫn test được thật. Khi BE xong thì fallback tự tắt, không cần sửa FE.
- Gợi ý prompt: yêu cầu model trả **JSON thuần** (không markdown fence), rồi `JSON.parse` + validate; retry 1 lần nếu parse lỗi.


---

## 3. Trang "Tìm nguồn tham khảo" (Search & Read)

### Mục đích

User đang làm bài tập / assignment → cần tìm tài liệu tham khảo (paper, bài blog, docs, Wikipedia…) → đọc ngay trong app, copy trích dẫn, lưu vào note.

### Độ khó: **Trung bình** (không quá khó nhưng có mấy cái bẫy)

| Thành phần | Giải pháp gợi ý |
|---|---|
| **Search** | Google Custom Search API (100 query/ngày free) hoặc SerpAPI / Bing Web Search API. Không tự crawl Google (bị block). |
| **Extract nội dung** | Jina AI Reader (`https://r.jina.ai/http://...`), hoặc `readability` / `mozilla/readability` chạy server-side, hoặc `cheerio` + heuristic. |
| **Hiển thị** | Iframe sandboxed hoặc render HTML đã sanitize (DOMPurify). Cẩn thận CSP / XSS. |
| **Lưu trữ** | Bảng `references` (userId, url, title, snippet, savedAt, note?) — user bấm "Lưu" thì insert. |
| **UI** | Sidebar trái: search box + kết quả list. Pane phải: viewer (reader mode). Top bar: nút "Copy citation", "Lưu", "Mở gốc". |

### Rủi ro / lưu ý

- **Rate limit & chi phí**: Google CSE 100 req/ngày free, sau $5/1000 queries. SerpAPI ~$50/tháng.
- **Paywall / block**: Nhiều trang chặn bot (Cloudflare, login wall). Jina AI Reader bypass được khá nhiều.
- **Bản quyền**: Chỉ cho **xem/trích dẫn**, không lưu full-text bản quyền. UI phải rõ ràng "Chỉ để tham khảo cá nhân".
- **Sanitize HTML**: Bắt buộc DOMPurify trước khi render vào React (`dangerouslySetInnerHTML`).
- **CSP**: Nếu dùng iframe, cần `sandbox="allow-scripts allow-same-origin"` và `Content-Security-Policy` header.

### MVP gợi ý (1-2 ngày)

1. Backend: `POST /api/references/search` (proxy Google CSE / SerpAPI) → trả `{ items: [{ title, link, snippet }] }`.
2. Backend: `POST /api/references/extract` nhận `{ url }` → gọi Jina AI Reader → trả `{ title, content, markdown }`.
3. Backend: CRUD `references` (save/unsave/list) — permission `reference:create/view/delete`.
4. Frontend: Page `/references` (search sidebar + reader pane), nút "Lưu" ghi vào DB.
5. FE: nút "Copy citation" format APA/IEEE/BibTeX (dùng `citeproc` hoặc tự format đơn giản).

### Có thể mở rộng sau

- Import PDF/Đề tài → auto extract keyword → gợi ý search.
- Tích hợp Zotero / Mendeley export.
- RAG: embed saved references → semantic search sau này.

---

## 4. Các việc khác đang chờ (từ ARCHITECTURE.md)

- [ ] Global error handler (Express) thay vì try/catch rải rác
- [ ] Bật rateLimiter, CORS đọc từ env
- [ ] Fix `trueFalse` → `true_false` trong `AdminQuestionsPage`
- [ ] Thêm case `fill_blank` vào `getQuestionTypeLabel`
- [ ] Xoá `src/app/App.tsx` rỗng
- [ ] Gom `unwrapData` + error message helper vào `http.ts`
- [ ] Đổi `types/answer.ts` + `types/attemptsquestion.ts` sang `id: string`
- [ ] Viết test (Vitest backend, React Testing Library frontend)
- [ ] CI pipeline (lint + build + test)

---

## 5. Ý tưởng mở rộng (backlog)

- [ ] Spaced repetition cho flashcard (dùng `nextReview` field đã có)
- [ ] Leaderboard realtime (WebSocket / SSE) cho typing
- [ ] Import quiz từ PDF/Word (OCR + LLM extract) — hiện chỉ support Excel/CSV/JSON
- [ ] Multi-language UI (i18n)
- [ ] Dark mode (Tailwind `dark:` variant đã sẵn sàng)
- [ ] PWA (offline attempt sync khi online lại)