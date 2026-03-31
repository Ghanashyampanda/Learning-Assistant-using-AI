import Document from '../models/Document.js'
import Flashcard  from '../models/Flashcard.js'
import Quiz from '../models/Quiz.js'
import ChatHistory from '../models/ChatHistory.js'
import * as geminiService from '../utils/geminiService.js'
import {findRelevantChunks} from '../utils/textChunker.js'

//@desc Generate flashcards from document
//@route POST /api/ai/generate-flashcards
//@access Private
export const generateFlashcards = async (req, res, next) => {
    try {
        const { documentId,count=10 } = req.body;

        if(!documentId) {
            return res.status(400).json({
                success: false,
                error: "Document ID is required",
                statusCode: 400
            });
        }

        const document = await Document.findOne({
            _id: documentId,
            userId: req.user._id,
            status: 'completed'
        });

        if(!document) {
            return res.status(404).json({
                success: false,
                error: "Document not found, access denied, or processing not completed",
                statusCode: 404
            });
        }

        //Generate flashcards using Gemini API

        const cards = await geminiService.generateFlashcards(
            document.extractedText,
            parseInt(count)
        );
        //Save flashcards to database
        const flashcardSet = await Flashcard.create({
            userId: req.user._id,
            documentId: document._id,
            cards: cards.map(card => ({
                question: card.question,
                answer: card.answer,
                difficulty: card.difficulty,
                revieweCount: 0,
                isStudied: false
            }))
        });

        res.status(201).json({
            success: true,
            data: flashcardSet,
            message: 'Flashcards generated successfully'
        });

    }catch(error) {
        next(error);
    }
};

//@desc Generate quiz from document
//@route POST /api/ai/generate-quiz
//@access Private
export const generateQuiz = async (req, res, next) => {
    try{
        const {documentId, numQuestions = 5,title} = req.body;
        if(!documentId) {
            return res.status(400).json({
                success: false,
                error: "Please provide document ID",
                statusCode: 400
            });
        }

        const document = await Document.findOne({
            _id: documentId,
            userId: req.user._id,
            status: 'completed'
        });
        if(!document) {
            return res.status(404).json({
                success: false,
                error: "Document not found, access denied, or processing not completed",
                statusCode: 404
            });
        }

        //Generate quiz using Gemini API
        const questions = await geminiService.generateQuiz(
            document.extractedText,
            parseInt(numQuestions),
            title
        );

        //Save quiz to database
        const quiz = await Quiz.create({
            userId: req.user._id,
            documentId: document._id,
            title: title || `${document.title} - Quiz`,
            questions: questions,
            totalQuestions: questions.length,
            userAnswered: [],
            Score: 0
        });

        res.status(201).json({
            success: true,
            data: quiz,
            message: 'Quiz generated successfully',
        });
    }catch(error) {
        next(error);
    }
};

//@desc Generate summary from document
//@route POST /api/ai/generate-summary
//@access Private
export const generateSummary = async (req, res, next) => {
    try{
        const { documentId } = req.body;
        if(!documentId) {
            return res.status(400).json({
                success: false,
                error: "Please provide document ID",
                statusCode: 400
            });
        }

        const document = await Document.findOne({
            _id: documentId,
            userId: req.user._id,
            status: 'completed'
        });
        if(!document) {
            return res.status(404).json({
                success: false,
                error: "Document not found, access denied, or processing not completed",
                statusCode: 404
            });
        }
        
        //Generate summary using Gemini API
        const summary = await geminiService.generateSummary(document.extractedText);

        res.status(200).json({
            success: true,
            data: {
                documentId: document._id,
                title: document.title,
                summary: summary
            },
            message: 'Summary generated successfully'
            });
    }catch(error) {
        next(error);
    }
};

//@desc Chat with AI about a document
//@route POST /api/ai/chat
//@access Private
export const chat = async (req, res, next) => {
    try{
        const { documentId, question } = req.body;
        if(!documentId || !question) {
            return res.status(400).json({
                success: false,
                error: "Please provide document ID and question",
                statusCode: 400
            });
        }

        const document = await Document.findOne({
            _id: documentId,
            userId: req.user._id
        });
        if(!document) {
            return res.status(404).json({
                success: false,
                error: "Document not found or access denied",
                statusCode: 404
            });
        }
        if(document.status === 'processing') {
            return res.status(400).json({
                success: false,
                error: "Document is still being processed. Please wait a moment and try again.",
                statusCode: 400
            });
        }
        if(document.status === 'error') {
            return res.status(400).json({
                success: false,
                error: "Document processing failed. Please re-upload the document.",
                statusCode: 400
            });
        }
        //Find relevant chunks from document
        const relevantChunks = findRelevantChunks(document.chunks, question, 5);
        const chunkIndices = relevantChunks.map(c => c.chunkIndex);
        //Get or create chat history 
        let chatHistory = await ChatHistory.findOne({
            userId: req.user._id,
            documentId: document._id
        });
        if(!chatHistory) {
            chatHistory = await ChatHistory.create({
                userId: req.user._id,
                documentId: document._id,
                messages: []
            });
        }

        //Generate response using Gemini API
        const answer = await geminiService.chatWithContext(question, relevantChunks);

        //save conversation to chat history
        chatHistory.messages.push({
            role: 'user',
            content: question,
            timestamp: new Date(),
            relevantChunks: []
        },{
            role: 'assistant',
            content: answer,
            timestamp: new Date(),
            relevantChunks: chunkIndices
        });
        await chatHistory.save();
    
        res.status(200).json({
            success: true,
            data: {
                question,
                answer,
                relevantChunks: chunkIndices,
                chatHistoryId: chatHistory._id
            },
            message: 'Response generated successfully'
        });

    }catch(error) {
        next(error);
    }
};

//@desc Explain a concept from document
//@route POST /api/ai/explain-concept
//@access Private
export const explainConcept = async (req, res, next) => {
    try{
        const { documentId, concept } = req.body;
        if(!documentId || !concept) {
            return res.status(400).json({
                success: false,
                error: "Please provide document ID and concept",
                statusCode: 400
            });
        }

        const document = await Document.findOne({
            _id: documentId,
            userId: req.user._id,
            status: 'completed'
        });
        if(!document) {
            return res.status(404).json({
                success: false,
                error: "Document not found, access denied, or processing not completed",
                statusCode: 404
            });
        }

        //Find relevant chunks from document
        const relevantChunks = findRelevantChunks(document.chunks, concept, 3);
        const context = relevantChunks.map(c => c.content).join('\n\n');

        //Generate explanation using Gemini API
        const explanation = await geminiService.explainConcept(concept, context);

        res.status(200).json({
            success: true,
            data: {
                concept,
                explanation,
                relevantChunks: relevantChunks.map(c => c.chunkIndex)
            },
            message: 'Explanation generated successfully'
        });

    }catch(error) {
        next(error);
    }
};

//@desc get chat history for a document
//@route GET /api/ai/chat-history/:documentId
//@access Private
export const getChatHistory = async (req, res, next) => {
    try{
        const { documentId } = req.params;
        if(!documentId) {
            return res.status(400).json({
                success: false,
                error: "Please provide documentID",
                statusCode: 400
            });
        }
        const chatHistory = await ChatHistory.findOne({
            userId: req.user._id,
            documentId: documentId
        }).select('messages');//Only return messages array

        if(!chatHistory) {
            return res.status(200).json({
                success: true,
                data: [],//return empty array if no chat history found
                message: 'No chat history found for this document'
            });
        }

        res.status(200).json({
            success: true,
            data: chatHistory.messages,
            message: 'Chat history retrieved successfully'
        });
    }catch(error) {
        next(error);
    }
};

