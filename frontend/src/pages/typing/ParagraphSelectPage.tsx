import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, BookOpen } from "lucide-react";

interface TextSnippet {
  id: number;
  title: string;
  preview: string;
  content: string;
  difficulty: "easy" | "medium" | "hard";
}

const MOCK_PARAGRAPHS: TextSnippet[] = [
  {
    id: 1,
    title: "The Quick Brown Fox",
    preview: "A classic typing practice text...",
    content:
      "The quick brown fox jumps over the lazy dog. This pangram contains every letter of the English alphabet at least once.",
    difficulty: "easy",
  },
  {
    id: 2,
    title: "Technology Today",
    preview: "Modern technology has changed our world...",
    content:
      "Technology has revolutionized the way we communicate, work, and live. From smartphones to artificial intelligence, innovation continues to shape our society.",
    difficulty: "medium",
  },
  {
    id: 3,
    title: "Climate Change",
    preview: "Environmental challenges and solutions...",
    content:
      "Climate change represents one of the most pressing challenges of our time. Rising global temperatures are affecting ecosystems, weather patterns, and human societies worldwide.",
    difficulty: "hard",
  },
  {
    id: 4,
    title: "Digital Marketing",
    preview: "The evolution of marketing in the digital age...",
    content:
      "Digital marketing has transformed how businesses reach their customers. Social media, email campaigns, and content marketing are essential components of modern marketing strategies.",
    difficulty: "medium",
  },
  {
    id: 5,
    title: "Science Fiction",
    preview: "Exploring imaginary worlds and future possibilities...",
    content:
      "Science fiction explores imaginative concepts like space travel, artificial intelligence, and parallel universes. These stories inspire us to think about the future and the possibilities it may hold.",
    difficulty: "medium",
  },
  {
    id: 6,
    title: "Ancient History",
    preview: "Learning from civilizations of the past...",
    content:
      "Ancient civilizations such as Egypt, Greece, and Rome have left profound legacies that continue to influence our modern world. Their contributions to art, philosophy, and governance remain significant today.",
    difficulty: "hard",
  },
];

export default function ParagraphSelectPage() {
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const handleSelect = (snippet: TextSnippet) => {
    // Store selected paragraph in localStorage for TypingPage to retrieve
    localStorage.setItem("selectedParagraph", snippet.content);
    navigate("/practice/typing");
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "hard":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <BookOpen size={32} className="text-blue-400" />
            <h1 className="text-4xl font-bold text-white">Select a Paragraph</h1>
          </div>
          <p className="text-gray-300 text-lg">
            Choose a text to practice typing. Select the difficulty level that
            suits your skill.
          </p>
        </div>

        {/* Grid of Paragraphs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {MOCK_PARAGRAPHS.map((snippet) => (
            <div
              key={snippet.id}
              className={`bg-slate-700 rounded-lg overflow-hidden hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-300 cursor-pointer transform hover:scale-105 ${
                selectedId === snippet.id ? "ring-2 ring-blue-400" : ""
              }`}
              onClick={() => setSelectedId(snippet.id)}
            >
              <div className="p-6">
                {/* Title and Difficulty */}
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-bold text-white truncate">
                    {snippet.title}
                  </h3>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ml-2 ${getDifficultyColor(
                      snippet.difficulty
                    )}`}
                  >
                    {snippet.difficulty}
                  </span>
                </div>

                {/* Preview */}
                <p className="text-gray-300 mb-4 line-clamp-3">
                  {snippet.content}
                </p>

                {/* Stats */}
                <div className="flex justify-between text-sm text-gray-400 mb-6 border-t border-gray-600 pt-4">
                  <span>{snippet.content.split(" ").length} words</span>
                  <span>{snippet.content.length} characters</span>
                </div>

                {/* Select Button */}
                <button
                  onClick={() => handleSelect(snippet)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 flex items-center justify-center gap-2"
                >
                  Start
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Info */}
        <div className="mt-12 bg-slate-700 rounded-lg p-6">
          <h3 className="text-white font-semibold mb-3">💡 Tips</h3>
          <ul className="text-gray-300 space-y-2">
            <li>• Easy texts are perfect for warm-up sessions</li>
            <li>• Medium texts help you maintain consistent speed</li>
            <li>• Hard texts challenge you and improve your accuracy</li>
            <li>• Try different difficulty levels to find your sweet spot</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
