import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Plus, Edit2, Trash2, ChevronRight, ChevronLeft } from "lucide-react";

interface Chapter {
  id: number;
  name: string;
  description: string;
  questionCount: number;
}

const MOCK_SUBJECTS: Record<number, { name: string }> = {
  1: { name: "Mathematics" },
  2: { name: "Physics" },
  3: { name: "Chemistry" },
  4: { name: "Biology" },
};

const MOCK_CHAPTERS: Record<number, Chapter[]> = {
  1: [
    {
      id: 1,
      name: "Basic Algebra",
      description: "Introduction to algebraic expressions",
      questionCount: 15,
    },
    {
      id: 2,
      name: "Geometry",
      description: "Shapes and spatial relationships",
      questionCount: 12,
    },
    {
      id: 3,
      name: "Trigonometry",
      description: "Angles and trigonometric functions",
      questionCount: 10,
    },
  ],
  2: [
    {
      id: 1,
      name: "Mechanics",
      description: "Motion and forces",
      questionCount: 18,
    },
    {
      id: 2,
      name: "Thermodynamics",
      description: "Heat and energy",
      questionCount: 14,
    },
  ],
  3: [
    {
      id: 1,
      name: "Organic Chemistry",
      description: "Carbon-based compounds",
      questionCount: 20,
    },
  ],
  4: [
    {
      id: 1,
      name: "Cell Biology",
      description: "Structure and function of cells",
      questionCount: 16,
    },
  ],
};

export default function AdminChapterPage() {
  const { id: subjectId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const subjectIdNum = parseInt(subjectId || "1");
  const subjectName = MOCK_SUBJECTS[subjectIdNum]?.name || "Unknown";

  const [chapters, setChapters] = useState<Chapter[]>(
    MOCK_CHAPTERS[subjectIdNum] || []
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ name: "", description: "" });

  const handleOpenModal = (chapter?: Chapter) => {
    if (chapter) {
      setFormData({
        name: chapter.name,
        description: chapter.description,
      });
      setEditingId(chapter.id);
      setIsEditing(true);
    } else {
      setFormData({ name: "", description: "" });
      setIsEditing(false);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData({ name: "", description: "" });
    setEditingId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert("Chapter name is required");
      return;
    }

    if (isEditing && editingId) {
      setChapters((prev) =>
        prev.map((c) =>
          c.id === editingId
            ? { ...c, name: formData.name, description: formData.description }
            : c
        )
      );
    } else {
      const newChapter: Chapter = {
        id: Math.max(...chapters.map((c) => c.id), 0) + 1,
        name: formData.name,
        description: formData.description,
        questionCount: 0,
      };
      setChapters((prev) => [...prev, newChapter]);
    }

    handleCloseModal();
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this chapter?")) {
      setChapters((prev) => prev.filter((c) => c.id !== id));
    }
  };

  const handleNavigateToQuestions = (chapterId: number) => {
    navigate(`/admin/chapters/${chapterId}/questions`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 mb-8">
          <button
            onClick={() => navigate("/admin/subjects")}
            className="flex items-center gap-1 text-blue-400 hover:text-blue-300 transition"
          >
            <ChevronLeft size={16} />
            Subjects
          </button>
          <ChevronRight size={16} className="text-gray-500" />
          <span className="text-white font-semibold">{subjectName}</span>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Chapters</h1>
            <p className="text-gray-300">Manage chapters for {subjectName}</p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200"
          >
            <Plus size={20} />
            Add Chapter
          </button>
        </div>

        {/* Chapters Table */}
        <div className="bg-slate-700 rounded-lg overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-600 border-b border-slate-500">
                <tr>
                  <th className="px-6 py-4 text-left text-white font-semibold">
                    Chapter Name
                  </th>
                  <th className="px-6 py-4 text-left text-white font-semibold">
                    Description
                  </th>
                  <th className="px-6 py-4 text-center text-white font-semibold">
                    Questions
                  </th>
                  <th className="px-6 py-4 text-center text-white font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {chapters.map((chapter, index) => (
                  <tr
                    key={chapter.id}
                    className={`border-b border-slate-600 hover:bg-slate-600 transition ${
                      index % 2 === 0 ? "bg-slate-700" : "bg-slate-750"
                    }`}
                  >
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleNavigateToQuestions(chapter.id)}
                        className="text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 hover:underline"
                      >
                        {chapter.name}
                        <ChevronRight size={16} />
                      </button>
                    </td>
                    <td className="px-6 py-4 text-gray-300">
                      {chapter.description}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        {chapter.questionCount}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex gap-3 justify-center">
                        <button
                          onClick={() => handleOpenModal(chapter)}
                          className="text-yellow-400 hover:text-yellow-300 transition p-2"
                          title="Edit"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(chapter.id)}
                          className="text-red-400 hover:text-red-300 transition p-2"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {chapters.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">No chapters found</p>
              <p className="text-gray-500 text-sm mt-2">
                Click "Add Chapter" to create one
              </p>
            </div>
          )}
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-slate-700 rounded-lg shadow-lg max-w-md w-full p-6">
              <h2 className="text-2xl font-bold text-white mb-4">
                {isEditing ? "Edit Chapter" : "Add New Chapter"}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-gray-300 font-semibold mb-2">
                    Chapter Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    placeholder="e.g., Basic Algebra"
                    className="w-full bg-slate-600 text-white border-2 border-slate-500 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-400"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 font-semibold mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Brief description of the chapter"
                    rows={4}
                    className="w-full bg-slate-600 text-white border-2 border-slate-500 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-400"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 bg-slate-600 hover:bg-slate-500 text-white font-semibold py-2 px-4 rounded-lg transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition"
                  >
                    {isEditing ? "Update" : "Create"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
