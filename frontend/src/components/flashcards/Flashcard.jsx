import { useState } from "react";
import { Star, RotateCcw, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

const Flashcard = ({ flashcard, onToggleStar, onToggleLearned }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleFlip = () => {
    if (!isAnimating) {
      setIsFlipped(!isFlipped);
      setIsAnimating(true);
    }
  };

  return (
    <div className="relative w-full h-72" style={{ perspective: "1000px" }}>
      <motion.div
        className="relative w-full h-full cursor-pointer"
        style={{ transformStyle: "preserve-3d" }}
        initial={false}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
        onAnimationComplete={() => setIsAnimating(false)}
        onClick={handleFlip}
      >
        {/* FRONT of the card (Question) */}
        <div
          className="absolute inset-0 w-full h-full bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-2xl shadow-xl shadow-slate-200/50 p-8 flex flex-col justify-between"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
          }}
        >
          {/* Top Actions */}
          <div className="flex items-start justify-between">
            <div className="bg-slate-100 text-[10px] text-slate-600 rounded px-4 py-1 uppercase font-semibold">
              {flashcard.difficulty}
            </div>
            <div className="flex gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleLearned(flashcard._id);
                }}
                title="Mark as Learned"
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 ${
                  flashcard.isLearned
                    ? "bg-linear-to-br from-green-400 to-green-500 text-white shadow-lg shadow-green-500/25"
                    : "bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-green-500"
                }`}
              >
                <CheckCircle
                  className="w-4 h-4"
                  strokeWidth={2}
                  fill={flashcard.isLearned ? "currentColor" : "none"}
                />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleStar(flashcard._id);
                }}
                title="Star Flashcard"
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 ${
                  flashcard.isStarred
                    ? "bg-linear-to-br from-amber-400 to-yellow-500 text-white shadow-lg shadow-amber-500/25"
                    : "bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-amber-500"
                }`}
              >
                <Star
                  className="w-4 h-4"
                  strokeWidth={2}
                  fill={flashcard.isStarred ? "currentColor" : "none"}
                />
              </button>
            </div>
          </div>

          {/* Question Content */}
          <div className="flex-1 flex items-center justify-center px-4 py-6">
            <p className="text-lg font-semibold text-slate-900 text-center leading-relaxed">
              {flashcard.question}
            </p>
          </div>

          {/* Flip Indicator */}
          <div className="flex items-center justify-center gap-2 text-xs text-slate-400 font-medium">
            <RotateCcw className="w-3.5 h-3.5" strokeWidth={2} />
            <span>Click to reveal answer</span>
          </div>
        </div>

        {/* BACK of the card (Answer) */}
        <div
          className="absolute inset-0 w-full h-full bg-linear-to-br from-emerald-500 to-teal-500 border-2 border-emerald-400/60 rounded-2xl shadow-xl shadow-emerald-500/30 p-8 flex flex-col justify-between text-white"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          {/* Top Actions */}
          <div className="flex justify-end gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleLearned(flashcard._id);
              }}
              title="Mark as Learned"
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 ${
                flashcard.isLearned
                  ? "bg-white/30 backdrop-blur-sm text-white border border-white/40 shadow-lg"
                  : "bg-white/20 backdrop-blur-sm text-white/70 hover:bg-white/30 hover:text-white border border-white/20"
              }`}
            >
              <CheckCircle
                className="w-4 h-4"
                strokeWidth={2}
                fill={flashcard.isLearned ? "currentColor" : "none"}
              />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleStar(flashcard._id);
              }}
              title="Star Flashcard"
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 ${
                flashcard.isStarred
                  ? "bg-white/30 backdrop-blur-sm text-white border border-white/40 shadow-lg"
                  : "bg-white/20 backdrop-blur-sm text-white/70 hover:bg-white/30 hover:text-white border border-white/20"
              }`}
            >
              <Star
                className="w-4 h-4"
                strokeWidth={2}
                fill={flashcard.isStarred ? "currentColor" : "none"}
              />
            </button>
          </div>

          {/* Answer Content */}
          <div className="flex-1 flex items-center justify-center text-center px-4 py-6">
            <p className="text-base text-white text-center leading-relaxed font-medium">
              {flashcard.answer}
            </p>
          </div>

          {/* Flip Back Indicator */}
          <div className="flex items-center justify-center gap-2 text-xs text-white/70 font-medium">
            <RotateCcw className="w-3.5 h-3.5" strokeWidth={2} />
            <span>Click to see question</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Flashcard;