# AI Learning Assistant App

Welcome to the **AI Learning Assistant App**! This application is designed to revolutionize how students and professionals study by leveraging artificial intelligence to process documents, generate study materials, and provide interactive learning features. 

## 🚀 Features

* **Secure Authentication**: User registration and login protected by JSON Web Tokens (JWT).
* **Document Management**: Upload PDF documents. The application parses and intelligently extracts text content for AI processing.
* **Smart Flashcards**: Automatically generate interactive flashcards from your uploaded documents to boost memory retention.
* **Interactive Quizzes**: Test your knowledge with AI-generated quizzes. Take the quiz, submit your answers, and instantly view detailed results and explanations.
* **AI Chat & Summarization**: Discuss document contents with the AI Assistant. Ask it to "Generate Summary" or "Explain a Concept" for deeper understanding.
* **User Dashboard**: Keep track of your learning progress, recent documents, flashcards, and quizzes in one intuitive interface.

## 🛠️ Technology Stack

### Frontend (User Interface)
* **React 19 & Vite**: Fast and modern UI development.
* **Tailwind CSS v4**: Utility-first CSS framework for a sleek, responsive design.
* **React Router DOM**: Seamless single-page application routing.
* **Lucide React**: Beautiful icons.
* **Axios**: Promised-based HTTP client for API requests.

### Backend (Server & API)
* **Node.js & Express**: Robust and scalable backend server.
* **MongoDB & Mongoose**: Flexible NoSQL database for mapping data (Users, Documents, Quizzes, Flashcards).
* **Google Generative AI (Gemini)**: The AI engine powering content generation, summarizations, and chat interactions.
* **Multer**: Handling multipart/form-data for PDF uploads.
* **PDF-Parse**: Extracting raw text from uploaded PDF files.
* **Bcryptjs & JWT**: Securing user passwords and managing authenticated sessions.

## 📁 Project Structure

```text
AI Learning Assistant App/
├── frontend/             # React application
│   ├── src/
│   │   ├── components/   # Reusable UI elements (auth, layouts, common)
│   │   ├── context/      # React context (AuthContext)
│   │   ├── pages/        # Views (Auth, Dashboard, Documents, Flashcards, Quizzes, Profile)
│   │   ├── services/     # API integration logic
│   │   ├── utils/        # Helper functions
│   │   └── App.jsx       # Main application routing
│   └── package.json
│
├── backend/              # Express API Server
│   ├── controllers/      # Route logic (auth, documents, ai, flashcards, quizzes)
│   ├── models/           # Mongoose schemas
│   ├── routes/           # API endpoints routing
│   ├── middleware/       # JWT and Auth checking
│   ├── .env              # Environment variables
│   ├── Server.js         # Entry point for Backend
│   └── package.json
│
└── README.md             # Project documentation (You are here)
```

## ⚙️ Getting Started

### Prerequisites
* Node.js and npm installed.
* MongoDB running locally or a MongoDB Atlas URI.
* A Google Gemini API Key.

### 1. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Ensure your `.env` file is configured with your secrets:
   ```env
   PORT=8000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   GEMINI_API_KEY=your_google_gemini_api_key
   ```
4. Start the server (development mode uses Nodemon):
   ```bash
   npm run dev
   ```

### 2. Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open the application in your browser (usually `http://localhost:5173` or `http://localhost:5174`).

## 📈 Evolution & Recent Fixes
This project has seen continuous improvements:
* Restructured project directories and resolved `.env` loading issues.
* Handled JWT invalid signature errors during authentication reliably.
* Resolved backend 500 error bugs on AI Actions (Generate Summary & Explain Concept).
* Fixed MongoDB route execution overlaps using proper Express routing methodologies.
* Implemented a full Quiz Flow: fixing route params (`quizId`), preventing 404s, tracking `completedAt` timestamps, and designing an interactive `QuizResultPage` to review question breakdowns and scores.
