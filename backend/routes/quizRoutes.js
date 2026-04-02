import express from 'express';
import {
    getQuizzes,
    getQuizById,
    submitQuiz,
    getQuizResults,
    deleteQuiz
} from '../controllers/quizController.js';
import protect from '../middleware/auth.js';

const router = express.Router();

//all routes are protected
router.use(protect);

router.route('/quiz/:id').get(getQuizById).delete(deleteQuiz);
router.get('/:documentId', getQuizzes);
router.post('/:id/submit', submitQuiz);
router.get('/:id/results', getQuizResults);
router.delete('/:id', deleteQuiz);
export default router;