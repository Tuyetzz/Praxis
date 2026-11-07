import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, RotateCcw, Sparkles } from "lucide-react";
import { createTypingResult } from "../../api/typingResults";
import { getPublicTypingTexts } from "../../api/typingTexts";
import type { TypingText } from "../../types/typingText";
import PageShell from "../../components/PageShell";
import Card from "../../components/ui/Card";
import Alert from "../../components/ui/Alert";
import Button from "../../components/ui/Button";

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
  const submitLockRef = useRef(false);

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
      localStorage.removeItem("selectedTypingText");
    } else {
      loadDefaultText();
    }

    return () => {
      mounted = false;
    };
  }, []);

  // Timer: runs while typing is active and at least one character is entered.
  useEffect(() => {
    const startedAt = startedAtRef.current;
    if (stats.isActive && currentIndex > 0 && startedAt !== null) {
      timerRef.current = setInterval(() => {
        const elapsed = Math.max(1, Math.floor((Date.now() - startedAt) / 1000));
        setStats((prev) => ({ ...prev, timeElapsed: elapsed }));
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [stats.isActive, currentIndex]);

  // WPM / accuracy, recomputed as the run progresses.
  useEffect(() => {
    if (stats.timeElapsed > 0 && currentIndex > 0) {
      const minutes = stats.timeElapsed / 60;
      const words = currentIndex / 5; // average word length is 5 characters
      const wpm = Math.round(words / minutes);
      const accuracy = Math.round(((currentIndex - mistakes.length) / currentIndex) * 100);

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
      if (!startedAtRef.current) startedAtRef.current = Date.now();
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
    submitLockRef.current = false;
    setStats({ wpm: 0, accuracy: 100, timeElapsed: 0, isActive: false });
    inputRef.current?.focus();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const getCharClass = (index: number) => {
    if (index < currentIndex) {
      return mistakes.includes(index)
        ? "bg-danger text-white"
        : "bg-success text-white";
    }
    if (index === currentIndex) {
      return "bg-primary text-primary-fg animate-pulse";
    }
    return "text-muted";
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

  // Save the result once per completed run (local-only texts are not persisted).
  useEffect(() => {
    if (!isComplete || hasSubmitted) return;
    if (!activeText || activeText.id.startsWith("local-")) return;
    if (submitLockRef.current) return;
    submitLockRef.current = true;

    const durationSeconds = Math.max(1, stats.timeElapsed);
    const minutes = durationSeconds / 60;
    const rawWpm = Math.round(input.length / 5 / minutes) || 0;

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
        setSubmitError("Unable to save your typing result.");
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

  const progress = paragraph.length ? (currentIndex / paragraph.length) * 100 : 0;

  return (
    <PageShell
      width="lg"
      title="Typing practice"
      subtitle={activeText ? `Passage: ${activeText.title}` : "Improve your speed and accuracy."}
      actions={
        <Button
          variant="secondary"
          size="sm"
          icon={<BookOpen size={15} />}
          onClick={() => navigate("/practice/select")}
        >
          Choose passage
        </Button>
      }
    >
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatTile value={stats.wpm} label="Words per minute" tone="text-primary" />
        <StatTile value={`${stats.accuracy}%`} label="Accuracy" tone="text-success" />
        <StatTile value={formatTime(stats.timeElapsed)} label="Elapsed" tone="text-foreground" />
      </div>

      <Card className="mb-5">
        <p className="mb-5 font-mono text-xl leading-relaxed tracking-wide sm:text-2xl">
          {loadingText ? (
            <span className="text-muted">Loading passage...</span>
          ) : (
            paragraph.split("").map((char, index) => (
              <span key={index} className={`${getCharClass(index)} rounded-sm px-0.5`}>
                {char === " " ? " " : char}
              </span>
            ))
          )}
        </p>

        {isComplete && (
          <Alert tone="success" className="mb-4">
            <span className="inline-flex items-center gap-2 font-semibold">
              <Sparkles size={16} />
              Typing complete! Great job.
            </span>
          </Alert>
        )}

        {submitError && (
          <Alert tone="warning" className="mb-4">
            {submitError}
          </Alert>
        )}

        <input
          ref={inputRef}
          type="text"
          value={input}
          onKeyDown={(e) => {
            handleBackspace(e);
            handleKeyPress(e);
          }}
          className="w-full rounded-control border border-border bg-surface px-4 py-3 font-mono text-foreground transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25"
          placeholder="Start typing here..."
          autoFocus
        />
      </Card>

      <div className="mb-5 flex flex-wrap gap-3">
        <Button icon={<RotateCcw size={16} />} onClick={handleRestart}>
          Restart
        </Button>
        <Button
          variant="secondary"
          icon={<BookOpen size={16} />}
          onClick={() => navigate("/practice/select")}
        >
          Select another passage
        </Button>
      </div>

      <Card>
        <div className="mb-2 flex justify-between text-sm text-muted">
          <span>Progress</span>
          <span>
            {currentIndex} / {paragraph.length}
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-surface-sunken">
          <div
            className="h-2 rounded-full bg-primary transition-all duration-300 ease-smooth"
            style={{ width: `${progress}%` }}
          />
        </div>
      </Card>
    </PageShell>
  );
}

function StatTile({ value, label, tone }: { value: string | number; label: string; tone: string }) {
  return (
    <Card className="text-center">
      <p className={`text-4xl font-bold tabular-nums ${tone}`}>{value}</p>
      <p className="mt-1 text-sm text-muted">{label}</p>
    </Card>
  );
}
