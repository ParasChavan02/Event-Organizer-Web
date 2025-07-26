EventSpark: Full-Stack Event Organizer Web Application
(Replace this placeholder with an actual screenshot of your deployed application!)

🚀 Live Demo
Check out the live deployed application here:
https://event-organizer-web.onrender.com/

✨ Overview
EventSpark is a comprehensive, full-stack web application designed to help users effortlessly plan, promote, and manage their events. From small gatherings to large conferences, EventSpark provides a streamlined experience for event organizers.

🌟 Features
User Authentication: Secure local signup/login with password hashing (bcrypt.js) and seamless integration with Google OAuth 2.0 for federated logins.

Secure Sessions: Utilizes JWT (JSON Web Tokens) for API authentication and connect-mongo for robust session management.

Event Management (CRUD): Authenticated users can create, view, edit, and delete their personalized events.

Responsive UI: A modern, visually appealing, and responsive user interface built with custom CSS, ensuring optimal experience across various devices.

Contact Form: A dedicated contact section (currently simulates submission, ready for backend integration).

💻 Technologies Used
Frontend:

HTML5: Structure and content.

CSS3: Custom styling, animations, transitions, and responsive design.

JavaScript (Vanilla JS): Client-side logic and API interactions.

Fonts: Inter, Montserrat (Google Fonts).

Backend:

Node.js: JavaScript runtime environment.

Express.js: Web application framework for building RESTful APIs.

MongoDB Atlas: Cloud-hosted NoSQL database for data storage.

Mongoose: ODM (Object Data Modeling) library for MongoDB and Node.js.

bcrypt.js: Library for hashing passwords.

jsonwebtoken (JWT): For creating and verifying authentication tokens.

Passport.js: Authentication middleware for Node.js.

passport-local: For email/password authentication.

passport-google-oauth20: For Google OAuth integration.

express-session: Session middleware for Express.

connect-mongo: MongoDB session store for express-session.

dotenv: For managing environment variables.

cors: Middleware for enabling Cross-Origin Resource Sharing.

Deployment:

Render: Unified platform for deploying both frontend and backend as a single service.

Git/GitHub: Version control and code hosting.

🚀 Getting Started Locally
Follow these steps to set up and run the project on your local machine.

Prerequisites
Node.js (v18 or higher recommended)

npm (Node Package Manager)

MongoDB Atlas Account (for cloud database)

Google Cloud Project (for Google OAuth credentials)

Git

1. Clone the Repository
git clone https://github.com/ParasChavan02/Event-Organiser-Website.git
cd Event-Organiser-Website

2. Backend Setup (server/)
Navigate into the server directory:

cd server

Install Dependencies
npm install

Create .env File
Create a file named .env in the server/ directory and add your environment variables. Do NOT commit this file to Git.

PORT=5000
MONGO_URI=mongodb+srv://<your_username>:<your_password>@<your_cluster_name>.mongodb.net/<your_database_name>?retryWrites=true&w=majority
JWT_SECRET=a_very_strong_and_random_jwt_secret_key_change_this_in_production
SESSION_SECRET=another_long_and_random_session_secret_key_for_express_session
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET

Replace placeholders with your actual credentials from MongoDB Atlas and Google Cloud Console.

Run the Backend
npm start
# Or for development with auto-restart:
# npm run dev

The backend server will run on http://localhost:5000.

3. Frontend Setup (public/)
The frontend is served statically by the Node.js backend. For local development, you can open public/index.html directly in your browser or use a live server extension.

Important: Ensure your public/js/script.js has const API_BASE_URL = '/api'; for local testing with the unified server.

4. Google OAuth Configuration (Local)
For Google Login to work locally, ensure your Google Cloud Console OAuth 2.0 Client ID has:

Authorized JavaScript origins: http://localhost:8000

Authorized redirect URIs: http://localhost:5000/api/auth/google/callback

☁️ Deployment
This application is designed for unified deployment on platforms like Render.

Deployment Steps Summary:
Update Code: Ensure server/server.js is configured to serve static files (as provided in the latest updates) and public/js/script.js uses const API_BASE_URL = '/api';.

Git Push: Commit all your code changes and push them to your GitHub repository's main branch.

Render Setup:

Create a new Web Service on Render.

Connect your GitHub repository.

Set Root Directory to server/.

Set Build Command to npm install.

Set Start Command to node server.js.

Add Environment Variables (MONGO_URI, JWT_SECRET, etc.) directly in Render's dashboard.

Google Cloud Console Updates (Live):

Update your OAuth 2.0 Client ID in Google Cloud Console.

Authorized JavaScript origins: Add your Render service's URL (e.g., https://event-organizer-web.onrender.com).

Authorized redirect URIs: Add your Render service's callback URL (e.g., https://event-organizer-web.onrender.com/api/auth/google/callback).

MongoDB Atlas Network Access:

In MongoDB Atlas, add Render's outbound IP addresses to your cluster's Network Access list. Alternatively, for testing, temporarily allow access from 0.0.0.0/0 (not recommended for production).

🤝 Contributing
Feel free to fork the repository, open issues, or submit pull requests.

📄 License
This project is licensed under the ISC License.