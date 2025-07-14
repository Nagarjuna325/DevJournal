DevBugJournal
A full-stack web application for tracking, documenting, and managing software bugs and development issues.
Users can create issues, attach files (stored in Neon/Postgres DB), add related links, and get AI-powered suggestions.

Features
User authentication (login/register)
Create, view, edit, and delete issues
Attach files (PDFs, images, etc.) to issues (stored in Neon DB)
Add related links to issues
AI-powered troubleshooting suggestions
Responsive dashboard with calendar view
Tech Stack
Frontend: React, Vite
Backend: Node.js, Express, TypeScript
Database: Neon (Postgres)
Authentication: Passport.js
File Uploads: Multer (files stored in DB, not on disk)
AI Integration: OpenAI (for suggestions)
Getting Started
1. Clone the repository
   
 git clone https://github.com/<your-username>/<repo-name>.git
 cd <repo-name>
3. Install dependencies
      npm install
4. Set up environment variables
       
Create a .env file in the root directory:
       DATABASE_URL=your-neon-db-connection-string
       OPENAI_API_KEY=your-openai-api-key
3. Build the project
        npm run build
4. Start the backend server
         npm start
         
5. Start the frontend (development mode)
        npm run dev
   
Usage
Visit http://localhost:5173 (or the port shown in your terminal) for the frontend.
API endpoints are proxied to the backend (see vite.config.ts).
Upload files via the issue form; files are stored in Neon DB and shown as links in the issue card.
Example Commands
Notes
.env is excluded from version control for security.
Files are stored in the database, not on disk.
Make sure your Neon DB is set up and accessible.


Example Commands
# Install dependencies
npm install

# Build project (TypeScript + frontend)
npm run build

# Start backend server (production)
npm start

# Start frontend (development)
npm run dev

Notes
Files are stored in the database, not on disk.
Make sure your Neon DB is set up and accessible.

