import dotenv from 'dotenv';

dotenv.config();

const BASE_URL = `http://localhost:${process.env.PORT || 8000}/api`;
let token = '';
let testDocumentId = '';
let testQuizId = '';

const runTests = async () => {
    console.log('--- Starting Quiz API Tests ---');

    try {
        // 1. Login to get token
        const loginRes = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'test@example.com',
                password: 'password123'
            })
        });
        const loginData = await loginRes.json();
        if (loginRes.ok) {
            token = loginData.token;
            console.log('Login successful');
        } else {
            console.error('Login failed');
            process.exit(1);
        }

        // 2. Get Documents to get a documentId
        const docsRes = await fetch(`${BASE_URL}/documents`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const docsData = await docsRes.json();
        if (docsRes.ok && docsData.data.length > 0) {
            testDocumentId = docsData.data[0]._id;
            console.log('Found document:', testDocumentId);
        } else {
            console.error('No documents found for testing');
            process.exit(1);
        }

        // 3. Test Get Quizzes for Document
        console.log('\nTesting Get Quizzes for Document...');
        const quizListRes = await fetch(`${BASE_URL}/quizzes/${testDocumentId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const quizListData = await quizListRes.json();
        if (quizListRes.ok) {
            console.log(`SUCCESS: Found ${quizListData.count} quizzes`);
            if (quizListData.data.length > 0) {
                testQuizId = quizListData.data[0]._id;
            }
        } else {
            console.error('FAILED: Get Quizzes failed', quizListData);
        }

        if (!testQuizId) {
            console.log('No quiz found, skipping individual quiz tests');
            return;
        }

        // 4. Test Get Quiz by ID
        console.log('\nTesting Get Quiz by ID...');
        const quizRes = await fetch(`${BASE_URL}/quizzes/quiz/${testQuizId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const quizData = await quizRes.json();
        if (quizRes.ok) {
            console.log('SUCCESS: Quiz retrieved:', quizData.data.title);
        } else {
            console.error('FAILED: Get Quiz by ID failed', quizData);
        }

        // 5. Test Submit Quiz (Dummy submission)
        console.log('\nTesting Submit Quiz...');
        const submitRes = await fetch(`${BASE_URL}/quizzes/${testQuizId}/submit`, {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                answers: [
                    { questionIndex: 0, selectedAnswer: 'Newton' }
                ]
            })
        });
        const submitData = await submitRes.json();
        if (submitRes.ok) {
            console.log('SUCCESS: Quiz submitted, score:', submitData.data.score);
        } else {
            console.error('FAILED: Quiz submission failed', submitData);
        }

        // 6. Test Get Results
        console.log('\nTesting Get Quiz Results...');
        const resultsRes = await fetch(`${BASE_URL}/quizzes/${testQuizId}/results`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const resultsData = await resultsRes.json();
        if (resultsRes.ok) {
            console.log('SUCCESS: Results retrieved, score:', resultsData.data.quiz.score);
        } else {
            console.error('FAILED: Get Results failed', resultsData);
        }

        console.log('\n--- Quiz API Tests Completed ---');
        process.exit(0);

    } catch (error) {
        console.error('Error during Quiz API tests:', error.message);
        process.exit(1);
    }
};

runTests();
