import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { RotateCcw, BookOpen } from "lucide-react";
import { createTypingResult } from "../../api/typingResults";
import { getPublicTypingTexts } from "../../api/typingTexts";
import type { TypingText } from "../../types/typingText";
import AppHeader from "../../components/AppHeader";

interface TypingStats {
  wpm: number;
  accuracy: number;
  timeElapsed: number;
  isActive: boolean;
}

const LOCAL_DEFAULT_TEXTS: TypingText[] = [
  {
    id: "local-1",
    authorId: "",
    title: "Quick Brown Fox",
    content:
      "The quick brown fox jumps over the lazy dog. This pangram includes every letter of the alphabet.",
    language: "english",
    isPublic: false,
    isDefault: true,
    difficulty: "easy",
  },
  {
    id: "local-2",
    authorId: "",
    title: "Modern Tech",
    content:
      "Technology shapes how we communicate, learn, and create. Practice smooth, steady typing with this paragraph.",
    language: "english",
    isPublic: false,
    isDefault: true,
    difficulty: "medium",
  },
  {
    id: "local-3",
    authorId: "",
    title: "Focused Practice",
    content:
      "Consistent practice builds accuracy. Keep your eyes on the text and your fingers on the home row.",
    language: "english",
    isPublic: false,
    isDefault: true,
    difficulty: "medium",
  },
];

function getStoredTypingText(): TypingText | null {
  const raw = localStorage.getItem("selectedTypingText");
  if (!raw) return null;
  try {
    return JSON.parse(raw) as TypingText;
  } catch {
    localStorage.removeItem("selectedTypingText");
    return null;
  }
}

function buildErrorTags(input: string, mistakes: number[]) {
  const tags: Record<string, number> = {};
  mistakes.forEach((index) => {
    const char = input[index];
    if (!char) return;
    tags[char] = (tags[char] ?? 0) + 1;
  });
  return Object.keys(tags).length ? tags : undefined;
}

export default function TypingPage() {
  const navigate = useNavigate();
  const [activeText, setActiveText] = useState<TypingText | null>(null);
  const [paragraph, setParagraph] = useState("");
  const [loadingText, setLoadingText] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [input, setInput] = useState("");
  const [mistakes, setMistakes] = useState<number[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [completedAt, setCompletedAt] = useState<number | null>(null);
  const [stats, setStats] = useState<TypingStats>({
    wpm: 0,
    accuracy: 100,
    timeElapsed: 0,
    isActive: false,
  });
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startedAtRef = useRef<number | null>(null);

  useEffect(() => {
    let mounted = true;
    const storedText = getStoredTypingText();

    async function loadDefaultText() {
      try {
        const publicTexts = await getPublicTypingTexts();
        if (!mounted) return;
        if (publicTexts.length > 0) {
          const randomText = publicTexts[Math.floor(Math.random() * publicTexts.length)];
          setActiveText(randomText);
          setParagraph(randomText.content);
          setLoadingText(false);
          return;
        }
      } catch {
        if (!mounted) return;
      }

      const fallback = LOCAL_DEFAULT_TEXTS[Math.floor(Math.random() * LOCAL_DEFAULT_TEXTS.length)];
      setActiveText(fallback);
      setParagraph(fallback.content);
      setLoadingText(false);
    }

    if (storedText) {
      setActiveText(storedText);
      setParagraph(storedText.content);
      setLoadingText(false);
    } else {
      loadDefaultText();
    }

    return () => {
      mounted = false;
    };
  }, []);

  // Handle timer
  useEffect(() => {
    if (stats.isActive && currentIndex > 0 && startedAtRef.current) {
      timerRef.current = setInterval(() => {
        const elapsed = Math.max(1, Math.floor((Date.now() - startedAtRef.current) / 1000));
        setStats((prev) => ({
          ...prev,
          timeElapsed: elapsed,
        }));
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [stats.isActive, currentIndex]);

  // Calculate WPM and Accuracy
  useEffect(() => {
    if (stats.timeElapsed > 0 && currentIndex > 0) {
      const minutes = stats.timeElapsed / 60;
      const words = currentIndex / 5; // Average word length is 5 characters
      const wpm = Math.round(words / minutes);
      const accuracy = Math.round(
        ((currentIndex - mistakes.length) / currentIndex) * 100
      );

      setStats((prev) => ({
        ...prev,
        wpm: isFinite(wpm) ? wpm : 0,
        accuracy: Math.max(0, accuracy),
      }));
    }
  }, [currentIndex, mistakes, stats.timeElapsed]);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (currentIndex >= paragraph.length) return;

    if (!stats.isActive) {
      if (!startedAtRef.current) {
        startedAtRef.current = Date.now();
      }
      setStats((prev) => ({ ...prev, isActive: true }));
    }

    const char = e.key;
    const expectedChar = paragraph[currentIndex];

    if (char === expectedChar) {
      setCurrentIndex((prev) => prev + 1);
      setInput((prev) => prev + char);
    } else if (e.key !== "Backspace" && e.key.length === 1) {
      setMistakes((prev) => [...prev, currentIndex]);
      setInput((prev) => prev + char);
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handleBackspace = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setInput((prev) => prev.slice(0, -1));
      setMistakes((prev) => prev.filter((m) => m !== currentIndex - 1));
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setInput("");
    setMistakes([]);
    setSubmitError(null);
    setHasSubmitted(false);
    setCompletedAt(null);
    startedAtRef.current = null;
    setStats({
      wpm: 0,
      accuracy: 100,
      timeElapsed: 0,
      isActive: false,
    });
    inputRef.current?.focus();
  };

  const handleSelectText = () => {
    navigate("/practice/select");
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const getCharClass = (index: number) => {
    if (index < currentIndex) {
      return mistakes.includes(index)
        ? "bg-red-500 text-white"
        : "bg-green-500 text-white";
    } else if (index === currentIndex) {
      return "bg-blue-400 text-white animate-pulse";
    } else {
      return "text-gray-400";
    }
  };

  const isComplete = currentIndex >= paragraph.length && currentIndex > 0;

  useEffect(() => {
    if (!isComplete || completedAt) return;
    const finishTime = Date.now();
    setCompletedAt(finishTime);
    setStats((prev) => ({ ...prev, isActive: false }));
    if (startedAtRef.current) {
      const elapsed = Math.max(1, Math.floor((finishTime - startedAtRef.current) / 1000));
      setStats((prev) => ({ ...prev, timeElapsed: elapsed }));
    }
  }, [completedAt, isComplete]);

  useEffect(() => {
    if (!isComplete || hasSubmitted) return;
    if (!activeText || activeText.id.startsWith("local-")) return;

    const durationSeconds = Math.max(1, stats.timeElapsed);
    const minutes = durationSeconds / 60;
    const rawWpm = Math.round((input.length / 5) / minutes) || 0;

    createTypingResult({
      textId: activeText.id,
      wpm: stats.wpm,
      accuracy: stats.accuracy,
      rawWpm,
      durationSeconds,
      errorTags: buildErrorTags(input, mistakes),
    })
      .then(() => {
        setHasSubmitted(true);
        setSubmitError(null);
      })
      .catch(() => {
        setHasSubmitted(true);
        setSubmitError("Unable to save typing result.");
      });
  }, [
    activeText,
    hasSubmitted,
    input,
    isComplete,
    mistakes,
    stats.accuracy,
    stats.timeElapsed,
    stats.wpm,
  ]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "radial-gradient(circle at 10% 10%, #e0f2fe 0%, #0f172a 55%, #020617 100%)",
        fontFamily: '"Space Grotesk", "IBM Plex Sans", sans-serif',
      }}
    >
      <AppHeader />
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Fast Type</h1>
          <p className="text-gray-300">
            Practice your typing skills and improve your WPM
          </p>
          {activeText && (
            <p className="text-gray-400 text-sm mt-2">
              Text: {activeText.title}
            </p>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-slate-700 rounded-lg p-4 text-center">
            <div className="text-4xl font-bold text-blue-400">{stats.wpm}</div>
            <div className="text-sm text-gray-300 mt-2">WPM</div>
          </div>
          <div className="bg-slate-700 rounded-lg p-4 text-center">
            <div className="text-4xl font-bold text-green-400">
              {stats.accuracy}%
            </div>
            <div className="text-sm text-gray-300 mt-2">Accuracy</div>
          </div>
          <div className="bg-slate-700 rounded-lg p-4 text-center">
            <div className="text-4xl font-bold text-purple-400">
              {formatTime(stats.timeElapsed)}
            </div>
            <div className="text-sm text-gray-300 mt-2">Time</div>
          </div>
        </div>

        {/* Typing Area */}
        <div className="bg-slate-700 rounded-lg p-8 mb-8">
          <div className="mb-6 text-2xl leading-relaxed font-mono">
            {loadingText ? (
              <span className="text-gray-400">Loading text...</span>
            ) : (
              paragraph.split("").map((char, index) => (
                <span key={index} className={`${getCharClass(index)} px-0.5`}>
                  {char === " " ? "\u00A0" : char}
                </span>
              ))
            )}
          </div>

          {isComplete && (
            <div className="bg-green-600 text-white p-4 rounded-lg text-center font-semibold">
              🎉 Typing complete! Great job!
            </div>
          )}

          {submitError && (
            <div className="bg-amber-500 text-white p-3 rounded-lg text-center font-semibold mt-3">
              {submitError}
            </div>
          )}

          <input
            ref={inputRef}
            type="text"
            value={input}
            onKeyDown={(e) => {
              handleBackspace(e);
              handleKeyPress(e);
            }}
            className="w-full bg-slate-600 text-white placeholder-gray-400 border-2 border-slate-500 rounded-lg p-3 focus:outline-none focus:border-blue-400"
            placeholder="Start typing here..."
            autoFocus
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-4 flex-wrap">
          <button
            onClick={handleRestart}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200"
          >
            <RotateCcw size={20} />
            Restart
          </button>
          <button
            onClick={handleSelectText}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200"
          >
            <BookOpen size={20} />
            Select Text
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mt-8">
          <div className="flex justify-between mb-2">
            <span className="text-gray-300 text-sm">Progress</span>
            <span className="text-gray-300 text-sm">
              {currentIndex}/{paragraph.length}
            </span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{
                width: paragraph.length
                  ? `${(currentIndex / paragraph.length) * 100}%`
                  : "0%",
              }}
            ></div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
