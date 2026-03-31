import dns from 'dns';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

// Force usage of Google DNS to bypass ISP/Local DNS issues with MongoDB SRV records
dns.setServers(['8.8.8.8', '8.8.4.4']);

dotenv.config();
import User from './models/User.js';
import Document from './models/Document.js';
import Flashcard from './models/Flashcard.js';
import Quiz from './models/Quiz.js';
import ChatHistory from './models/ChatHistory.js';

dotenv.config();

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB for seeding...');

        // Clear existing data
        await User.deleteMany({});
        await Document.deleteMany({});
        await Flashcard.deleteMany({});
        await Quiz.deleteMany({});
        await ChatHistory.deleteMany({});
        console.log('Cleared existing data.');

        // Create a test user
        const salt = await bcrypt.genSalt(10);
        const password = await bcrypt.hash('password123', salt);
        
        const user = await User.create({
            username: 'testuser',
            email: 'test@example.com',
            password: 'password123', // Model has pre-save hook for hashing, but we can also do it here if needed. 
                                     // Actually, since it's a model method, let's just pass plain text and let the model handle it.
            profileImage: 'https://via.placeholder.com/150'
        });
        console.log('Created test user:', user.email);

        // Create a dummy document
        const document = await Document.create({
            userId: user._id,
            title: 'React JS Study Guide',
            fileName: 'react_js_study_guide.pdf',
            filePath: 'uploads/documents/react_js_study_guide.pdf',
            fileSize: 1024 * 1024,
            extractedText: 'React is a JavaScript library for building user interfaces.',
            chunks: [
                { content: 'React component lifecycle...', pageNumber: 1, chunkIndex: 0 },
            ],
            status: 'completed',
            lastAccessed: new Date()
        });
        console.log('Created dummy document:', document.title);

        // Create dummy flashcards (10 cards)
        const flashcard = await Flashcard.create({
            userId: user._id,
            documentId: document._id,
            cards: Array.from({ length: 10 }, (_, i) => ({
                question: `React Question ${i + 1}`,
                answer: `React Answer ${i + 1}`,
                difficulty: i % 3 === 0 ? 'easy' : i % 3 === 1 ? 'medium' : 'hard'
            }))
        });
        console.log('Created 10 dummy flashcards.');

        // Create dummy quiz
        const quiz = await Quiz.create({
            userId: user._id,
            documentId: document._id,
            title: 'React Js Guide Quize',
            questions: [
                {
                    question: 'What is JSX?',
                    options: ['JavaScript XML', 'JSON XML', 'Java Syntax Extension', 'JavaScript Extension'],
                    correctAnswer: 'JavaScript XML',
                    explanation: 'JSX allows us to write HTML in React.',
                    difficulty: 'easy'
                }
            ],
            totalQuestions: 1,
            completedAt: new Date()
        });
        console.log('Created dummy quiz:', quiz.title);

        // Create dummy chat history
        const chat = await ChatHistory.create({
            userId: user._id,
            documentId: document._id,
            messages: [
                { role: 'user', content: 'Explain the second law.' },
                { role: 'assistant', content: 'The second law states that force equals mass times acceleration (F=ma).' }
            ]
        });
        console.log('Created dummy chat history.');

        console.log('Seeding completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding data:');
        if (error.name === 'ValidationError') {
            for (let field in error.errors) {
                console.error(`- ${field}: ${error.errors[field].message}`);
            }
        } else {
            console.error(error);
        }
        process.exit(1);
    }
};

seedData();
