import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Document from './models/Document.js';
dotenv.config();

const checkDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');
        
        const docs = await Document.find({}).limit(5);
        if (docs.length === 0) {
            console.log('No documents found in DB');
        } else {
            docs.forEach(doc => {
                console.log(`ID: ${doc._id}, Title: ${doc.title}, Status: ${doc.status}, UserID: ${doc.userId}`);
            });
        }
        
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

checkDB();
