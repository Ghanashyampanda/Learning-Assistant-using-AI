// Using global fetch (supported in Node 18+)
// import fetch from 'node-fetch';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const BASE_URL = `http://localhost:${process.env.PORT || 8000}/api`;
let token = '';
let testUserId = '';
let testDocumentId = '';

const runTests = async () => {
    console.log('--- Starting API Tests ---');

    try {
        // 1. Test Login
        console.log('\nTesting Login...');
        const loginRes = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'test@example.com',
                password: 'password123'
            })
        });

        const loginText = await loginRes.text();
        let loginData;
        try {
            loginData = JSON.parse(loginText);
        } catch (e) {
            console.error('FAILED: Login response is not valid JSON');
            console.error('Raw Response:', loginText.slice(0, 500));
            process.exit(1);
        }

        if (loginRes.ok) {
            console.log('SUCCESS: Login successful');
            token = loginData.token;
        } else {
            console.error('FAILED: Login failed', loginData);
            process.exit(1);
        }

        // 2. Test Get Profile
        console.log('\nTesting Get Profile...');
        const profileRes = await fetch(`${BASE_URL}/auth/profile`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const profileData = await profileRes.json();
        if (profileRes.ok) {
            console.log('SUCCESS: Profile retrieved for', profileData.data.username);
            testUserId = profileData.data._id;
        } else {
            console.error('FAILED: Profile retrieval failed', profileData);
        }

        // 3. Test List Documents
        console.log('\nTesting List Documents...');
        const docsRes = await fetch(`${BASE_URL}/documents`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const docsData = await docsRes.json();
        if (docsRes.ok) {
            console.log(`SUCCESS: Found ${docsData.data.length} documents`);
            if (docsData.data.length > 0) {
                testDocumentId = docsData.data[0]._id;
            }
        } else {
            console.error('FAILED: Document listing failed', docsData);
        }

        // 4. Test Flashcards
        console.log('\nTesting List Flashcards...');
        const flashRes = await fetch(`${BASE_URL}/flashcards`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const flashData = await flashRes.json();
        if (flashRes.ok) {
            console.log(`SUCCESS: Found ${flashData.data.length} flashcard sets`);
        } else {
            console.error('FAILED: Flashcard listing failed', flashData);
        }

        // 5. Test AI Chat (Check if route is active)
        console.log('\nTesting AI Chat route existence...');
        const aiRes = await fetch(`${BASE_URL}/ai/chat`, {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                documentId: testDocumentId,
                message: 'Hello'
            })
        });
        const aiData = await aiRes.json();
        if (aiRes.status !== 404) {
             console.log('SUCCESS: AI Chat route reached (Status:', aiRes.status, ')');
        } else {
             console.error('FAILED: AI Chat route not found');
        }

        console.log('\n--- API Tests Completed ---');
        process.exit(0);

    } catch (error) {
        console.error('Error during API tests:', error.message);
        process.exit(1);
    }
};

runTests();
