import dns from 'dns';
dns.setServers(['8.8.8.8', '8.8.4.4']);

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { PDFParse } from 'pdf-parse';
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import Document from './models/Document.js';

const chunkText = (text, chunkSize = 500, overlap = 50) => {
    if (!text || typeof text !== 'string') return [];
    const cleanedText = text.replace(/\r\n/g, '\n').replace(/[ \t]+/g, ' ').trim();
    const paragraphs = cleanedText.split(/\n+/).filter(p => p.trim().length > 0);
    const chunks = [];
    let currentChunk = [];
    let currentWordCount = 0;
    let currentIndex = 0;
    for (const paragraph of paragraphs) {
        const paragraphWords = paragraph.trim().split(/\s+/);
        const paragraphWordCount = paragraphWords.length;
        if (currentWordCount + paragraphWordCount > chunkSize && currentChunk.length > 0) {
            chunks.push({ content: currentChunk.join('\n\n'), chunkIndex: currentIndex++, pageNumber: 0 });
            currentChunk = [paragraph.trim()];
            currentWordCount = paragraphWordCount;
        } else {
            currentChunk.push(paragraph.trim());
            currentWordCount += paragraphWordCount;
        }
    }
    if (currentChunk.length > 0) {
        chunks.push({ content: currentChunk.join('\n\n'), chunkIndex: currentIndex++, pageNumber: 0 });
    }
    if (chunks.length === 0 && cleanedText.length > 0) {
        chunks.push({ content: cleanedText, chunkIndex: 0, pageNumber: 0 });
    }
    return chunks;
};

const repair = async () => {
    try {
        console.log('Connecting to DB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected!');

        const docs = await Document.find({ status: { $in: ['error', 'processing'] } });
        console.log(`Found ${docs.length} documents with error/processing status`);

        for (const doc of docs) {
            console.log(`\nProcessing: ${doc.title} (${doc._id})`);

            let diskPath;
            if (doc.filePath.startsWith('http')) {
                const urlParts = doc.filePath.split('/uploads/documents/');
                if (urlParts.length < 2) {
                    console.log('  ERROR: Cannot extract filename from URL:', doc.filePath);
                    continue;
                }
                const filename = urlParts[1];
                diskPath = path.join(__dirname, 'uploads', 'documents', filename);
            } else {
                diskPath = path.join(__dirname, doc.filePath);
            }

            console.log(`  Looking for file at: ${diskPath}`);

            try {
                await fs.access(diskPath);
                console.log(`  File found! Extracting text...`);

                const dataBuffer = await fs.readFile(diskPath);
                const parser = new PDFParse({ data: dataBuffer });
                const result = await parser.getText();
                await parser.destroy();

                const text = result.text;
                console.log(`  Extracted ${text.length} chars.`);

                const chunks = chunkText(text, 500, 50);
                console.log(`  Created ${chunks.length} chunks.`);

                await Document.findByIdAndUpdate(doc._id, {
                    extractedText: text,
                    chunks: chunks,
                    status: 'completed',
                });
                console.log(`  SUCCESS! Document updated to 'completed'.`);
            } catch (fileErr) {
                console.log(`  ERROR: ${fileErr.message}`);
                // Mark as error if the PDF can't be read
                await Document.findByIdAndUpdate(doc._id, { status: 'error' });
            }
        }

        console.log('\nDone!');
        process.exit(0);
    } catch (error) {
        console.error('Fatal error:', error.message);
        process.exit(1);
    }
};

repair();
