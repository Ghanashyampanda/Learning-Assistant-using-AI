import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useReactToPrint } from 'react-to-print';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import {
  CheckCircle2,
  XCircle,
  Trophy,
  BarChart2,
  ArrowLeft,
  BookOpen,
  Printer,
  Download,
  RotateCcw,
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
  const [isRetrying, setIsRetrying] = useState(false);

  const printRef = useRef(null);

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

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: 'Quiz-Report',
  });

  const handlePrintLegacy = useReactToPrint({
    content: () => printRef.current,
    documentTitle: 'Quiz-Report',
  });

  const triggerPrint = () => {
    try {
      handlePrint();
    } catch {
      handlePrintLegacy();
    }
  };

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

  const handleDownloadPDF = async () => {
    const element = printRef.current;
    if (!element) return;

    try {
      toast.loading('Generating PDF...', { id: 'pdfLoading' });
      
      const originalGetContext = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function(type, options) {
        if (type === '2d') {
          options = options || {};
          options.willReadFrequently = true;
        }
        return originalGetContext.call(this, type, options);
      };

      let canvas;
      try {
        canvas = await html2canvas(element, { scale: 2, useCORS: true });
      } finally {
        HTMLCanvasElement.prototype.getContext = originalGetContext;
      }
      
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;
      
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = position - pageHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      pdf.save('quiz-report.pdf');
      
      toast.success('PDF Downloaded!', { id: 'pdfLoading' });
    } catch (error) {
      toast.error('Failed to generate PDF', { id: 'pdfLoading' });
      console.error(error);
    }
  };

  const handleRetry = async () => {
    try {
      setIsRetrying(true);
      toast.loading('Resetting quiz...', { id: 'resetQuiz' });
      await quizService.resetQuiz(quizId);
      toast.success('Quiz reset successful!', { id: 'resetQuiz' });
      navigate(`/quizzes/${quizId}`);
    } catch (error) {
      toast.error(error.message || 'Failed to retry quiz.', { id: 'resetQuiz' });
      console.error(error);
      setIsRetrying(false);
    }
  };

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
      <div className="flex flex-wrap items-center justify-between gap-4 pb-8">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-5 h-11 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm rounded-xl transition-all duration-200 active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={2.5} />
            Back
          </button>
          
          <button
            onClick={handleRetry}
            disabled={isRetrying}
            className="inline-flex items-center gap-2 px-5 h-11 bg-amber-100 hover:bg-amber-200 text-amber-700 font-semibold text-sm rounded-xl transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRetrying ? <Spinner size="sm" /> : <RotateCcw className="w-4 h-4" strokeWidth={2.5} />}
            {isRetrying ? 'Retrying...' : 'Retry Quiz'}
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={triggerPrint}
            className="inline-flex items-center gap-2 px-5 h-11 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm rounded-xl transition-all duration-200 active:scale-95 hidden md:flex"
          >
            <Printer className="w-4 h-4" strokeWidth={2.5} />
            Print
          </button>
          
          <button
            onClick={handleDownloadPDF}
            className="inline-flex items-center gap-2 px-5 h-11 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm rounded-xl transition-all duration-200 active:scale-95"
          >
            <Download className="w-4 h-4" strokeWidth={2.5} />
            PDF
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

      {/* Hidden Print Container */}
      <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
        <div ref={printRef} className="print-content" style={{ padding: '40px', backgroundColor: 'white', width: '800px', color: 'black', margin: '0 auto' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '10px', textAlign: 'center' }}>Quiz Report</h1>
          <p style={{ textAlign: 'center', fontSize: '18px', color: '#475569', marginBottom: '30px' }}>{quizMeta.title || 'General Quiz'}</p>
          
          <div style={{ display: 'flex', justifyContent: 'space-around', padding: '20px', backgroundColor: '#f8fafc', borderRadius: '12px', marginBottom: '40px' }}>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '24px', fontWeight: 'bold', color: scorePercent >= 50 ? '#10b981' : '#f43f5e' }}>{scorePercent}%</p>
              <p style={{ fontSize: '14px', color: '#64748b', textTransform: 'uppercase' }}>Final Score</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#334155' }}>{correctCount} / {totalQuestions}</p>
              <p style={{ fontSize: '14px', color: '#64748b', textTransform: 'uppercase' }}>Correct Answers</p>
            </div>
          </div>

          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px' }}>Question Breakdown</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {results.map((result, index) => (
              <div key={index} style={{ border: '1px solid #e2e8f0', padding: '20px', borderRadius: '8px', pageBreakInside: 'avoid' }}>
                <p style={{ fontWeight: '600', fontSize: '16px', marginBottom: '16px' }}>Q{index + 1}: {result.question}</p>
                
                <div style={{ marginBottom: '16px' }}>
                  <p style={{ fontSize: '15px' }}>
                    <span style={{ color: '#64748b' }}>Your Answer: </span>
                    <strong style={{ color: result.isCorrect ? '#10b981' : '#f43f5e' }}>{result.selectedAnswer}</strong>
                  </p>
                  {!result.isCorrect && (
                    <p style={{ fontSize: '15px', marginTop: '4px' }}>
                      <span style={{ color: '#64748b' }}>Correct Answer: </span>
                      <strong style={{ color: '#10b981' }}>{result.correctAnswer}</strong>
                    </p>
                  )}
                </div>

                <div style={{ backgroundColor: '#f0f9ff', borderLeft: '4px solid #0ea5e9', padding: '12px', borderRadius: '4px' }}>
                  <p style={{ fontSize: '14px', color: '#0369a1', fontWeight: 'bold', marginBottom: '4px' }}>Explanation:</p>
                  <p style={{ fontSize: '14px', color: '#0c4a6e' }}>{result.explanation}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizResultPage;