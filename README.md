# DevBugJournal

**DevBugJournal** is a full-stack web application for tracking, documenting, and managing software bugs and development issues.  
Users can create issues, attach files (stored in Neon/Postgres DB), add related links, and get AI-powered suggestions.

---

## ✨ Features

- 🔐 User authentication (Login/Register)
- 📝 Create, view, edit, and delete issues
- 📎 Attach files (PDFs, images, etc.) to issues (stored in Neon DB)
- 🔗 Add related links to issues
- 🤖 AI-powered troubleshooting suggestions (via OpenAI)
- 📅 Responsive dashboard with calendar view

---

## 🧰 Tech Stack

| Layer      | Technology                          |
|------------|--------------------------------------|
| Frontend   | React, Vite                          |
| Backend    | Node.js, Express, TypeScript         |
| Database   | Neon (PostgreSQL)                    |
| Auth       | Passport.js                          |
| File Upload| Multer (stored in database, not disk)|
| AI         | OpenAI API for suggestions           |

---

## 🚀 Getting Started

### 1. Clone the Repository


git clone https://github.com/<your-username>/<repo-name>.git
cd <repo-name>
2. Install Dependencies
bash
Copy
Edit
npm install
3. Set Up Environment Variables
Create a .env file in the root directory:

ini
Copy
Edit
DATABASE_URL=your-neon-db-connection-string
OPENAI_API_KEY=your-openai-api-key
🔒 .env is excluded from version control for security.

4. Build the Project
bash
Copy
Edit
npm run build
5. Start the Backend Server (Production)
bash
Copy
Edit
npm start
6. Start the Frontend (Development Mode)
bash
Copy
Edit
npm run dev
🖥️ Usage
Visit: http://localhost:5173 (or the port shown in your terminal) for the frontend.

API endpoints are proxied to the backend (see vite.config.ts).

Upload files via the issue form.

Files are stored in the Neon Postgres database.

Uploaded files are shown as downloadable links in the issue cards.

📌 Notes
Files are stored in the database, not on disk.

Ensure your Neon DB is correctly set up and accessible.

Uses OpenAI's API to provide smart suggestions for debugging and resolving issues.

💻 Example Commands
bash
Copy
Edit
# Install dependencies
npm install

# Build project (TypeScript + frontend)
npm run build

# Start backend server (production)
npm start

# Start frontend (development mode)
npm run dev
