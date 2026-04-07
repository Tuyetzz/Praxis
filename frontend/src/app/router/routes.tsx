// app/router/routes.tsx
import { Routes, Route, Navigate } from "react-router-dom";
import SubjectsPage from "../../pages/subjects/SubjectsPage";
import ChaptersPage from "../../pages/chapters/ChaptersPage";
import ExamConfigPage from "../../pages/exam-config/ExamConfigPage";
import LoginPage from "../../pages/auth/LoginPage";
import RegisterPage from "../../pages/auth/RegisterPage";
import ProtectedRoute from "./ProtectedRoute";
import AttemptDetailPage from "../../pages/attempts/AttemptDetailPage";
import TypingPage from "../../pages/typing/TypingPage";
import ParagraphSelectPage from "../../pages/typing/ParagraphSelectPage";
import AdminSubjectPage from "../../pages/admin/AdminSubjectPage";
import AdminChapterPage from "../../pages/admin/AdminChapterPage";
import AdminQuestionsPage from "../../pages/admin/AdminQuestionsPage";

export default function AppRoutes() {
  return (
      <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/subjects" element={<SubjectsPage />} />
        <Route path="/subjects/:id/chapters" element={<ChaptersPage />} />
        <Route path="/subjects/:id/chapters/:chapterId/config" element={<ExamConfigPage />} />
        <Route path="/attempts/:id" element={<AttemptDetailPage />} />
        
        {/* Typing Practice Routes */}
        <Route path="/practice/typing" element={<TypingPage />} />
        <Route path="/practice/select" element={<ParagraphSelectPage />} />
        
        {/* Admin Routes */}
        <Route path="/admin/subjects" element={<AdminSubjectPage />} />
        <Route path="/admin/subjects/:id/chapters" element={<AdminChapterPage />} />
        <Route path="/admin/chapters/:id/questions" element={<AdminQuestionsPage />} />
      </Route>


    </Routes>
  );
}
