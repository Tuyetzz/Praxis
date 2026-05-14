// app/router/routes.tsx
import { Routes, Route, Navigate } from "react-router-dom";
import SubjectsPage from "../../pages/quiz/subjects/SubjectsPage";
import ChaptersPage from "../../pages/quiz/chapters/ChaptersPage";
import ExamConfigPage from "../../pages/quiz/exam-config/ExamConfigPage";
import LoginPage from "../../pages/auth/LoginPage";
import RegisterPage from "../../pages/auth/RegisterPage";
import ProtectedRoute from "./ProtectedRoute";
import AttemptDetailPage from "../../pages/quiz/attempts/AttemptDetailPage";
import AttemptResultPage from "../../pages/quiz/attempts/AttemptResultPage";
import AttemptHistoryPage from "../../pages/quiz/attempts/AttemptHistoryPage";
import DashboardPage from "../../pages/dashboard/DashboardPage";
import TypingPage from "../../pages/typing/TypingPage";
import ParagraphSelectPage from "../../pages/typing/ParagraphSelectPage";
import AiTextPage from "../../pages/typing/AiTextPage";
import TypingHistoryPage from "../../pages/typing/TypingHistoryPage";
import AdminSubjectPage from "../../pages/admin/AdminSubjectPage";
import AdminChapterPage from "../../pages/admin/AdminChapterPage";
import AdminQuestionsPage from "../../pages/admin/AdminQuestionsPage";
import AdminTypingPage from "../../pages/admin/AdminTypingPage";
import AdminRolePermissionPage from "../../pages/admin/AdminRolePermissionPage";
import AdminRolePermissionsPage from "../../pages/admin/AdminRolePermissionsPage";
import AdminAccountsPage from "../../pages/admin/AdminAccountsPage";
import AdminAttemptHistoryPage from "../../pages/admin/AdminAttemptHistoryPage";
import FlashcardDecksPage from "../../pages/flashcards/FlashcardDecksPage";
import FlashcardStudyPage from "../../pages/flashcards/FlashcardStudyPage";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/subjects" element={<SubjectsPage />} />
        <Route path="/subjects/:id/chapters" element={<ChaptersPage />} />
        <Route path="/subjects/:id/chapters/:chapterId/config" element={<ExamConfigPage />} />
        <Route path="/attempts/:id" element={<AttemptDetailPage />} />
        <Route path="/attempts/:id/result" element={<AttemptResultPage />} />
        <Route path="/attempts/history" element={<AttemptHistoryPage />} />

        {/* Flashcard Routes */}
        <Route path="/flashcard-decks" element={<FlashcardDecksPage />} />
        <Route path="/flashcard-decks/:id" element={<FlashcardStudyPage />} />

        {/* Typing Practice Routes */}
        <Route path="/practice/typing" element={<TypingPage />} />
        <Route path="/practice/select" element={<ParagraphSelectPage />} />
        <Route path="/practice/typing/ai" element={<AiTextPage />} />
        <Route path="/practice/typing/history" element={<TypingHistoryPage />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<Navigate to="/admin/typing" replace />} />
        <Route path="/admin/typing" element={<AdminTypingPage />} />
        <Route path="/admin/roles" element={<AdminRolePermissionPage />} />
        <Route path="/admin/roles/:id/permissions" element={<AdminRolePermissionsPage />} />
        <Route path="/admin/accounts" element={<AdminAccountsPage />} />
        <Route path="/admin/attempts" element={<AdminAttemptHistoryPage />} />
        <Route path="/admin/subjects" element={<AdminSubjectPage />} />
        <Route path="/admin/subjects/:id/chapters" element={<AdminChapterPage />} />
        <Route path="/admin/chapters/:id/questions" element={<AdminQuestionsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
