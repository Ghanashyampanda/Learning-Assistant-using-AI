import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  CheckCircle2,
  XCircle,
  Trophy,
  BarChart2,
  ArrowLeft,
  BookOpen,
} from 'lucide-react';
import quizService from '../../services/quizService';
import PageHeader from '../../components/common/PageHeader';
import Spinner from '../../components/common/Spinner';
import toast from 'react-hot-toast';
import QuizResultQuestionCard from '../../components/quizzes/QuizResultQuestionCard';

const QuizResultPage = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();

  const [results, setResults] = useState(null);
  const [quizMeta, setQuizMeta] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await quizService.getQuizResults(quizId);
        setResults(response.data.results);
        setQuizMeta(response.data.quiz);
      } catch (error) {
        toast.error(error.message || 'Failed to load quiz results.');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (quizId) fetchResults();
  }, [quizId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner />
      </div>
    );
  }

  if (!results || !quizMeta) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-slate-600 text-lg">Results not found.</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 text-emerald-600 hover:underline text-sm font-medium"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  const correctCount = results.filter((r) => r.isCorrect).length;
  const totalQuestions = quizMeta.totalQuestions;
  const scorePercent = quizMeta.score;

  const scoreColor =
    scorePercent >= 80
      ? 'text-emerald-600'
      : scorePercent >= 50
      ? 'text-amber-500'
      : 'text-rose-500';

  const scoreBg =
    scorePercent >= 80
      ? 'from-emerald-500 to-teal-500'
      : scorePercent >= 50
      ? 'from-amber-400 to-orange-400'
      : 'from-rose-500 to-pink-500';

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader title="Quiz Results" />

      {/* Score Summary Card */}
      <div className="bg-white/80 backdrop-blur-xl border-2 border-slate-200 rounded-2xl shadow-xl shadow-slate-200/50 p-8 mb-8 text-center">
        <div
          className={`inline-flex items-center justify-center w-20 h-20 rounded-full bg-linear-to-br ${scoreBg} shadow-lg mb-4`}
        >
          <Trophy className="w-10 h-10 text-white" strokeWidth={2} />
        </div>

        <h2 className="text-2xl font-bold text-slate-900 mb-1">
          {quizMeta.title || 'Quiz Complete!'}
        </h2>
        <p className="text-slate-500 text-sm mb-6">
          {quizMeta.document?.title && `Document: ${quizMeta.document.title}`}
        </p>

        <div className="flex items-center justify-center gap-8 flex-wrap">
          <div className="text-center">
            <p className={`text-5xl font-black ${scoreColor}`}>{scorePercent}%</p>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mt-1">
              Score
            </p>
          </div>
          <div className="text-center">
            <p className="text-5xl font-black text-slate-700">
              {correctCount}/{totalQuestions}
            </p>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mt-1">
              Correct
            </p>
          </div>
        </div>

        {/* Score bar */}
        <div className="mt-6 relative h-3 bg-slate-100 rounded-full overflow-hidden max-w-sm mx-auto">
          <div
            className={`absolute inset-y-0 left-0 bg-linear-to-r ${scoreBg} rounded-full transition-all duration-700`}
            style={{ width: `${scorePercent}%` }}
          />
        </div>

        <p className="mt-3 text-sm font-medium text-slate-500">
          {scorePercent >= 80
            ? '🎉 Excellent work! Keep it up!'
            : scorePercent >= 50
            ? '👍 Good effort! Review the questions you missed.'
            : '📚 Keep studying — you can do it!'}
        </p>
      </div>

      {/* Detailed Breakdown */}
      <div className="mb-6 flex items-center gap-2">
        <BarChart2 className="w-5 h-5 text-slate-600" strokeWidth={2} />
        <h3 className="text-lg font-semibold text-slate-800">Question Breakdown</h3>
      </div>

      <div className="space-y-4 mb-8">
        {results.map((result, index) => (
          <QuizResultQuestionCard
            key={index}
            questionNumber={index + 1}
            question={result.question}
            options={result.options}
            correctAnswer={result.correctAnswer}
            selectedAnswer={result.selectedAnswer}
            explanation={result.explanation}
          />
        ))}
      </div>

      {/* Footer actions */}
      <div className="flex items-center justify-between gap-4 pb-8">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 px-5 h-11 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm rounded-xl transition-all duration-200 active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={2.5} />
          Back
        </button>

        {quizMeta.document?.title && (
          <Link
            to={`/documents`}
            className="inline-flex items-center gap-2 px-5 h-11 bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold text-sm rounded-xl transition-all duration-200 shadow-lg shadow-emerald-500/25 active:scale-95"
          >
            <BookOpen className="w-4 h-4" strokeWidth={2.5} />
            View Documents
          </Link>
        )}
      </div>
    </div>
  );
};

export default QuizResultPage;