import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { RotateCcw, BookOpen } from "lucide-react";

interface TypingStats {
  wpm: number;
  accuracy: number;
  timeElapsed: number;
  isActive: boolean;
}

export default function TypingPage() {
  const navigate = useNavigate();
  const [paragraph, setParagraph] = useState(
    "The quick brown fox jumps over the lazy dog. This is a test paragraph for the typing practice system."
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [input, setInput] = useState("");
  const [mistakes, setMistakes] = useState<number[]>([]);
  const [stats, setStats] = useState<TypingStats>({
    wpm: 0,
    accuracy: 100,
    timeElapsed: 0,
    isActive: false,
  });
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<NodeJS.Timeout>();

  // Handle timer
  useEffect(() => {
    if (stats.isActive && currentIndex > 0) {
      timerRef.current = setInterval(() => {
        setStats((prev) => ({
          ...prev,
          timeElapsed: prev.timeElapsed + 1,
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

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Typing Practice</h1>
          <p className="text-gray-300">
            Practice your typing skills and improve your WPM
          </p>
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
            {paragraph.split("").map((char, index) => (
              <span key={index} className={`${getCharClass(index)} px-0.5`}>
                {char === " " ? "\u00A0" : char}
              </span>
            ))}
          </div>

          {isComplete && (
            <div className="bg-green-600 text-white p-4 rounded-lg text-center font-semibold">
              🎉 Typing complete! Great job!
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
                width: `${(currentIndex / paragraph.length) * 100}%`,
              }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}
