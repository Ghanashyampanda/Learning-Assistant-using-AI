import React from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';

const QuizResultQuestionCard = ({
  question,
  options,
  correctAnswer,
  selectedAnswer,
  explanation,
  questionNumber,
}) => {
  const isCorrect = correctAnswer === selectedAnswer;

  return (
    <div
      className={`bg-white/80 backdrop-blur-xl border-2 rounded-2xl p-5 shadow-sm transition-all duration-200 ${
        isCorrect ? 'border-emerald-200' : 'border-rose-200'
      }`}
    >
      {/* Question Header */}
      <div className="flex items-start gap-3 mb-4">
        {isCorrect ? (
          <CheckCircle2
            className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0"
            strokeWidth={2.5}
          />
        ) : (
          <XCircle
            className="w-5 h-5 text-rose-500 mt-0.5 shrink-0"
            strokeWidth={2.5}
          />
        )}
        <p className="text-base font-semibold text-slate-900 leading-relaxed">
          {questionNumber && (
            <span className="text-slate-400 font-medium mr-2">
              Q{questionNumber}.
            </span>
          )}
          {question}
        </p>
      </div>

      {/* Options */}
      <div className="space-y-3 ml-8">
        {options.map((option, optIdx) => {
          // Normalize strings for safer comparison
          const normalize = (str) => typeof str === 'string' ? str.trim().toLowerCase() : '';
          
          // Try exact match first, then normalized match
          const isCorrectAnswer = option === correctAnswer || normalize(option) === normalize(correctAnswer);
          const isUserAnswer = option === selectedAnswer || normalize(option) === normalize(selectedAnswer);
          const isWrongUserAnswer = isUserAnswer && !isCorrectAnswer;

          return (
            <div
              key={optIdx}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150 border ${
                isCorrectAnswer
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800 shadow-sm'
                  : isWrongUserAnswer
                  ? 'bg-rose-50 border-rose-300 text-rose-800 shadow-sm'
                  : 'bg-slate-50 border-slate-200 text-slate-600 opacity-70 hover:opacity-100'
              }`}
            >
              <div className="shrink-0 flex items-center justify-center">
                {isCorrectAnswer ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" strokeWidth={2.5} />
                ) : isWrongUserAnswer ? (
                  <XCircle className="w-5 h-5 text-rose-500" strokeWidth={2.5} />
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-slate-300" />
                )}
              </div>
              
              <span className="leading-relaxed flex-1">{option}</span>
              
              {isUserAnswer && !isCorrectAnswer && (
                <span className="shrink-0 text-xs text-rose-500 font-bold bg-rose-100 px-2 py-1 rounded-md">
                  Your answer
                </span>
              )}
              {isCorrectAnswer && !isUserAnswer && (
                <span className="shrink-0 text-xs text-emerald-600 font-bold bg-emerald-100 px-2 py-1 rounded-md">
                  Correct answer
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Explanation */}
      {explanation && (
        <div className="ml-8 mt-4 px-4 py-3 bg-blue-50/80 border border-blue-200 rounded-xl relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-400"></div>
          <p className="text-xs font-bold text-blue-800 mb-1 tracking-wide uppercase">
            Explanation
          </p>
          <p className="text-sm text-blue-900/80 leading-relaxed">
            {explanation}
          </p>
        </div>
      )}
    </div>
  );
};

export default QuizResultQuestionCard;
