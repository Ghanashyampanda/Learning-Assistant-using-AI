import Document from '../models/Document.js';
import Flashcard from '../models/Flashcard.js';
import Quiz from '../models/Quiz.js';

// @desc Get user learning statistics for dashboard
// @route GET /api/progress/dashboard
// @access Private
export const getDashboard = async (req, res, next) => {
    try{
        const userId = req.user._id;

        //Get counts
        const totalDocuments = await Document.countDocuments({ userId });
        const totalFlashcardSets = await Flashcard.countDocuments({ userId });
        const totalQuizzes = await Quiz.countDocuments({ userId });
        const completedQuizzes = await Quiz.countDocuments({ userId, completedAt: { $ne: null } });

        //Get flashcard statistics
        const flashcardSets = await Flashcard.find({ userId });
        let totalFlashcards = 0;
        let reviewedFlashcards = 0;
        let starredFlashcards = 0;

        flashcardSets.forEach(set => {
            totalFlashcards += set.cards.length;
            reviewedFlashcards += set.cards.filter(card => card.reviewed).length;
            starredFlashcards += set.cards.filter(card => card.starred).length;
        });

        //Get quiz statistics
        const quizzes = await Quiz.find({ userId, completedAt: { $ne: null } });
        const averageScore = quizzes.length > 0 
         ? Math.round(quizzes.reduce((sum, q) => sum + q.score, 0) / quizzes.length)
         : 0;

         //Get recent activity
         const recentDocuments = await Document.find({ userId })
            .sort({ lastAccessed: -1 })
            .limit(5)
            .select('title filename lastAccessed status');

            const recentQuizzes = await Quiz.find({ userId })
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('documentId', 'title')
            .select('title score totalQuestions createdAt');

            //study streaks (simplified - in production,track daily activity)
            const studyStreak = Math.floor(Math.random() * 7) + 1; // mocked data for now

        res.status(200).json({
            success: true,
            data: {
                overview: {
                    totalDocuments,
                    totalFlashcardSets,
                    totalFlashcards,
                    reviewedFlashcards,
                    starredFlashcards,
                    totalQuizzes,
                    completedQuizzes,
                    averageScore,
                    studyStreak
                },
                recentActivity: {
                    documents: recentDocuments,
                    quizzes: recentQuizzes
                }
            },
            message: 'Progress retrieved successfully',
        });
    }catch(error) {
        next(error);
    }
};