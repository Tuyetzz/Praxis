import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Plus,
  Edit2,
  Trash2,
  ChevronRight,
  ChevronLeft,
  X,
} from "lucide-react";

type QuestionType = "single" | "multiple" | "trueFalse";

interface Option {
  id: string;
  text: string;
  isCorrect: boolean;
  explanation?: string;
}

interface Question {
  id: number;
  text: string;
  type: QuestionType;
  options: Option[];
}

const MOCK_CHAPTERS: Record<number, { name: string }> = {
  1: { name: "Basic Algebra" },
  2: { name: "Geometry" },
  3: { name: "Trigonometry" },
};

const MOCK_QUESTIONS: Record<number, Question[]> = {
  1: [
    {
      id: 1,
      text: "What is 2 + 2?",
      type: "single",
      options: [
        { id: "1", text: "3", isCorrect: false },
        { id: "2", text: "4", isCorrect: true, explanation: "2 + 2 = 4" },
        { id: "3", text: "5", isCorrect: false },
      ],
    },
    {
      id: 2,
      text: "Which of the following are prime numbers?",
      type: "multiple",
      options: [
        { id: "1", text: "2", isCorrect: true },
        { id: "2", text: "3", isCorrect: true },
        { id: "3", text: "4", isCorrect: false },
        { id: "4", text: "5", isCorrect: true },
      ],
    },
  ],
};

export default function AdminQuestionsPage() {
  const { id: chapterId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const chapterIdNum = parseInt(chapterId || "1");
  const chapterName = MOCK_CHAPTERS[chapterIdNum]?.name || "Unknown";

  const [questions, setQuestions] = useState<Question[]>(
    MOCK_QUESTIONS[chapterIdNum] || []
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<{
    text: string;
    type: QuestionType;
    options: Option[];
  }>({
    text: "",
    type: "single",
    options: [
      { id: "1", text: "", isCorrect: true },
      { id: "2", text: "", isCorrect: false },
    ],
  });

  const handleOpenModal = (question?: Question) => {
    if (question) {
      setFormData({
        text: question.text,
        type: question.type,
        options: question.options,
      });
      setEditingId(question.id);
      setIsEditing(true);
    } else {
      setFormData({
        text: "",
        type: "single",
        options: [
          { id: "1", text: "", isCorrect: true },
          { id: "2", text: "", isCorrect: false },
        ],
      });
      setIsEditing(false);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleAddOption = () => {
    const newOption: Option = {
      id: Date.now().toString(),
      text: "",
      isCorrect: false,
    };
    setFormData((prev) => ({
      ...prev,
      options: [...prev.options, newOption],
    }));
  };

  const handleRemoveOption = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      options: prev.options.filter((opt) => opt.id !== id),
    }));
  };

  const handleOptionChange = (
    id: string,
    field: keyof Option,
    value: string | boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      options: prev.options.map((opt) =>
        opt.id === id ? { ...opt, [field]: value } : opt
      ),
    }));
  };

  const handleSetCorrectOption = (id: string) => {
    if (formData.type === "single") {
      setFormData((prev) => ({
        ...prev,
        options: prev.options.map((opt) => ({
          ...opt,
          isCorrect: opt.id === id,
        })),
      }));
    } else {
      // For multiple choice, toggle the correct status
      setFormData((prev) => ({
        ...prev,
        options: prev.options.map((opt) =>
          opt.id === id ? { ...opt, isCorrect: !opt.isCorrect } : opt
        ),
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.text.trim()) {
      alert("Question text is required");
      return;
    }

    if (formData.options.length < 2) {
      alert("At least 2 options are required");
      return;
    }

    if (!formData.options.some((opt) => opt.isCorrect)) {
      alert("At least one option must be marked as correct");
      return;
    }

    if (isEditing && editingId) {
      setQuestions((prev) =>
        prev.map((q) =>
          q.id === editingId
            ? {
                ...q,
                text: formData.text,
                type: formData.type,
                options: formData.options,
              }
            : q
        )
      );
    } else {
      const newQuestion: Question = {
        id: Math.max(...questions.map((q) => q.id), 0) + 1,
        text: formData.text,
        type: formData.type,
        options: formData.options,
      };
      setQuestions((prev) => [...prev, newQuestion]);
    }

    handleCloseModal();
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this question?")) {
      setQuestions((prev) => prev.filter((q) => q.id !== id));
    }
  };

  const getQuestionTypeLabel = (type: QuestionType) => {
    switch (type) {
      case "single":
        return "Single Choice";
      case "multiple":
        return "Multiple Choice";
      case "trueFalse":
        return "True/False";
    }
  };

  const getTypeColor = (type: QuestionType) => {
    switch (type) {
      case "single":
        return "bg-blue-600";
      case "multiple":
        return "bg-purple-600";
      case "trueFalse":
        return "bg-orange-600";
    }
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
          <button
            onClick={() => navigate(-1)}
            className="text-blue-400 hover:text-blue-300 transition"
          >
            Chapters
          </button>
          <ChevronRight size={16} className="text-gray-500" />
          <span className="text-white font-semibold">{chapterName}</span>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Questions</h1>
            <p className="text-gray-300">Manage questions for {chapterName}</p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200"
          >
            <Plus size={20} />
            Add Question
          </button>
        </div>

        {/* Questions List */}
        <div className="space-y-4">
          {questions.length === 0 ? (
            <div className="bg-slate-700 rounded-lg p-12 text-center">
              <p className="text-gray-400 text-lg">No questions found</p>
              <p className="text-gray-500 text-sm mt-2">
                Click "Add Question" to create one
              </p>
            </div>
          ) : (
            questions.map((question) => (
              <div key={question.id} className="bg-slate-700 rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span
                        className={`${getTypeColor(question.type)} text-white px-3 py-1 rounded-full text-xs font-semibold`}
                      >
                        {getQuestionTypeLabel(question.type)}
                      </span>
                      <span className="text-gray-400 text-sm">
                        Q#{question.id}
                      </span>
                    </div>
                    <p className="text-white text-lg font-semibold mb-4">
                      {question.text}
                    </p>

                    {/* Options */}
                    <div className="space-y-2 ml-4">
                      {question.options.map((option) => (
                        <div
                          key={option.id}
                          className={`flex items-start gap-3 p-3 rounded-lg ${
                            option.isCorrect
                              ? "bg-green-900 border border-green-600"
                              : "bg-slate-600 border border-slate-500"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={option.isCorrect}
                            readOnly
                            disabled
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <p
                              className={`font-semibold ${
                                option.isCorrect
                                  ? "text-green-300"
                                  : "text-gray-300"
                              }`}
                            >
                              {option.text}
                            </p>
                            {option.explanation && (
                              <p className="text-sm text-gray-400 mt-1">
                                {option.explanation}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleOpenModal(question)}
                      className="text-yellow-400 hover:text-yellow-300 transition p-2 bg-slate-600 hover:bg-slate-500 rounded"
                      title="Edit"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(question.id)}
                      className="text-red-400 hover:text-red-300 transition p-2 bg-slate-600 hover:bg-slate-500 rounded"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-slate-700 rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">
                  {isEditing ? "Edit Question" : "Add New Question"}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-300 transition"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Question Text */}
                <div>
                  <label className="block text-gray-300 font-semibold mb-2">
                    Question Text
                  </label>
                  <textarea
                    value={formData.text}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        text: e.target.value,
                      }))
                    }
                    placeholder="Enter the question text"
                    rows={3}
                    className="w-full bg-slate-600 text-white border-2 border-slate-500 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-400"
                  />
                </div>

                {/* Question Type */}
                <div>
                  <label className="block text-gray-300 font-semibold mb-2">
                    Question Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => {
                      const newType = e.target.value as QuestionType;
                      if (newType === "trueFalse") {
                        setFormData((prev) => ({
                          ...prev,
                          type: newType,
                          options: [
                            {
                              id: "1",
                              text: "True",
                              isCorrect: true,
                            },
                            {
                              id: "2",
                              text: "False",
                              isCorrect: false,
                            },
                          ],
                        }));
                      } else {
                        setFormData((prev) => ({
                          ...prev,
                          type: newType,
                        }));
                      }
                    }}
                    className="w-full bg-slate-600 text-white border-2 border-slate-500 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-400"
                  >
                    <option value="single">Single Choice</option>
                    <option value="multiple">Multiple Choice</option>
                    <option value="trueFalse">True/False</option>
                  </select>
                </div>

                {/* Options */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <label className="block text-gray-300 font-semibold">
                      Options
                    </label>
                    {formData.type !== "trueFalse" && (
                      <button
                        type="button"
                        onClick={handleAddOption}
                        className="flex items-center gap-1 text-green-400 hover:text-green-300 transition text-sm"
                      >
                        <Plus size={16} />
                        Add Option
                      </button>
                    )}
                  </div>

                  <div className="space-y-4">
                    {formData.options.map((option, index) => (
                      <div key={option.id} className="space-y-2">
                        <div className="flex gap-3 items-start">
                          <input
                            type={
                              formData.type === "multiple"
                                ? "checkbox"
                                : "radio"
                            }
                            checked={option.isCorrect}
                            onChange={() =>
                              handleSetCorrectOption(option.id)
                            }
                            className="mt-2"
                          />
                          <div className="flex-1">
                            <input
                              type="text"
                              value={option.text}
                              onChange={(e) =>
                                handleOptionChange(
                                  option.id,
                                  "text",
                                  e.target.value
                                )
                              }
                              placeholder={`Option ${index + 1}`}
                              disabled={formData.type === "trueFalse"}
                              className="w-full bg-slate-600 text-white border-2 border-slate-500 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-400 disabled:opacity-50"
                            />
                          </div>
                          {formData.type !== "trueFalse" &&
                            formData.options.length > 2 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveOption(option.id)}
                                className="text-red-400 hover:text-red-300 transition p-2 mt-1"
                              >
                                <X size={18} />
                              </button>
                            )}
                        </div>

                        {/* Explanation */}
                        <input
                          type="text"
                          value={option.explanation || ""}
                          onChange={(e) =>
                            handleOptionChange(
                              option.id,
                              "explanation",
                              e.target.value
                            )
                          }
                          placeholder="Explanation (optional)"
                          className="w-full bg-slate-600 text-white border-2 border-slate-500 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-400 ml-8"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex gap-3 pt-4 border-t border-slate-600">
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
                    {isEditing ? "Update Question" : "Create Question"}
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
