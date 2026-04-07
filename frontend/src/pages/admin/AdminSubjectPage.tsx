import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Edit2, Trash2, ChevronRight } from "lucide-react";

interface Subject {
  id: number;
  name: string;
  description: string;
  chapterCount: number;
}

export default function AdminSubjectPage() {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState<Subject[]>([
    {
      id: 1,
      name: "Mathematics",
      description: "Basic to advanced math concepts",
      chapterCount: 12,
    },
    {
      id: 2,
      name: "Physics",
      description: "Classical and modern physics",
      chapterCount: 10,
    },
    {
      id: 3,
      name: "Chemistry",
      description: "Organic and inorganic chemistry",
      chapterCount: 8,
    },
    {
      id: 4,
      name: "Biology",
      description: "Cell biology and ecology",
      chapterCount: 9,
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ name: "", description: "" });

  const handleOpenModal = (subject?: Subject) => {
    if (subject) {
      setFormData({ name: subject.name, description: subject.description });
      setEditingId(subject.id);
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
      alert("Subject name is required");
      return;
    }

    if (isEditing && editingId) {
      setSubjects((prev) =>
        prev.map((s) =>
          s.id === editingId
            ? { ...s, name: formData.name, description: formData.description }
            : s
        )
      );
    } else {
      const newSubject: Subject = {
        id: Math.max(...subjects.map((s) => s.id), 0) + 1,
        name: formData.name,
        description: formData.description,
        chapterCount: 0,
      };
      setSubjects((prev) => [...prev, newSubject]);
    }

    handleCloseModal();
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this subject?")) {
      setSubjects((prev) => prev.filter((s) => s.id !== id));
    }
  };

  const handleNavigate = (subjectId: number) => {
    navigate(`/admin/subjects/${subjectId}/chapters`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Subjects</h1>
            <p className="text-gray-300">Manage all subjects and their chapters</p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200"
          >
            <Plus size={20} />
            Add Subject
          </button>
        </div>

        {/* Subjects Table */}
        <div className="bg-slate-700 rounded-lg overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-600 border-b border-slate-500">
                <tr>
                  <th className="px-6 py-4 text-left text-white font-semibold">
                    Subject Name
                  </th>
                  <th className="px-6 py-4 text-left text-white font-semibold">
                    Description
                  </th>
                  <th className="px-6 py-4 text-center text-white font-semibold">
                    Chapters
                  </th>
                  <th className="px-6 py-4 text-center text-white font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {subjects.map((subject, index) => (
                  <tr
                    key={subject.id}
                    className={`border-b border-slate-600 hover:bg-slate-600 transition ${
                      index % 2 === 0 ? "bg-slate-700" : "bg-slate-750"
                    }`}
                  >
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleNavigate(subject.id)}
                        className="text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 hover:underline"
                      >
                        {subject.name}
                        <ChevronRight size={16} />
                      </button>
                    </td>
                    <td className="px-6 py-4 text-gray-300">
                      {subject.description}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        {subject.chapterCount}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex gap-3 justify-center">
                        <button
                          onClick={() => handleOpenModal(subject)}
                          className="text-yellow-400 hover:text-yellow-300 transition p-2"
                          title="Edit"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(subject.id)}
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

          {subjects.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">No subjects found</p>
              <p className="text-gray-500 text-sm mt-2">
                Click "Add Subject" to create one
              </p>
            </div>
          )}
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-slate-700 rounded-lg shadow-lg max-w-md w-full p-6">
              <h2 className="text-2xl font-bold text-white mb-4">
                {isEditing ? "Edit Subject" : "Add New Subject"}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-gray-300 font-semibold mb-2">
                    Subject Name
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
                    placeholder="e.g., Mathematics"
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
                    placeholder="Brief description of the subject"
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
