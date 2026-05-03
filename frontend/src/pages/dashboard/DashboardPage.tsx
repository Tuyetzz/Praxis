import { Link } from "react-router-dom";
import AppHeader from "../../components/AppHeader";
import { useAuth } from "../../app/providers/AuthProvider";

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div>
      <AppHeader />

      <main style={{ maxWidth: 960, margin: "32px auto", padding: "0 16px" }}>
        <h1 style={{ marginBottom: 8 }}>Homepage Dashboard</h1>
        <p style={{ marginTop: 0, color: "#4b5563" }}>
          Welcome {user?.name}. You can start a quiz, practice typing, or open admin pages.
        </p>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 16,
            marginTop: 24,
          }}
        >
          <div style={{ border: "1px solid #e5e7eb", borderRadius: 10, padding: 16 }}>
            <h3 style={{ marginTop: 0 }}>Start Quiz</h3>
            <p style={{ color: "#6b7280" }}>Choose subject, chapter, and exam settings.</p>
            <Link to="/subjects">Go to subjects</Link>
          </div>

          <div style={{ border: "1px solid #e5e7eb", borderRadius: 10, padding: 16 }}>
            <h3 style={{ marginTop: 0 }}>Typing Practice</h3>
            <p style={{ color: "#6b7280" }}>Select a typing text and track WPM + accuracy.</p>
            <Link to="/practice/select">Go to typing texts</Link>
          </div>

          <div style={{ border: "1px solid #e5e7eb", borderRadius: 10, padding: 16 }}>
            <h3 style={{ marginTop: 0 }}>Flashcards</h3>
            <p style={{ color: "#6b7280" }}>Manage decks and study cards with flip mode.</p>
            <Link to="/flashcard-decks">Open flashcards</Link>
          </div>

          <div style={{ border: "1px solid #e5e7eb", borderRadius: 10, padding: 16 }}>
            <h3 style={{ marginTop: 0 }}>Admin Area</h3>
            <p style={{ color: "#6b7280" }}>Manage subjects, chapters, and questions.</p>
            <Link to="/admin/subjects">Open admin</Link>
          </div>
        </section>
      </main>
    </div>
  );
}
