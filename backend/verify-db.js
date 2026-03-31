import dns from 'dns';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dns.setServers(['8.8.8.8', '8.8.4.4']);
dotenv.config();

import User from './models/User.js';
import Document from './models/Document.js';
import Quiz from './models/Quiz.js';

const verifyDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const userCount = await User.countDocuments();
        const docCount = await Document.countDocuments();
        const quizCount = await Quiz.countDocuments();

        console.log(`Users: ${userCount}`);
        console.log(`Documents: ${docCount}`);
        console.log(`Quizzes: ${quizCount}`);

        if (userCount > 0) {
            const user = await User.findOne();
            console.log('Sample User:', { id: user._id, email: user.email });
            
            const docs = await Document.find({ userId: user._id });
            console.log(`Documents for this user: ${docs.length}`);
            if (docs.length > 0) {
                console.log('Sample Document:', { id: docs[0]._id, title: docs[0].title, userId: docs[0].userId });
            }
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

verifyDB();
