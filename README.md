🧳 Smart Trip Planner
Smart Trip Planner is a modern web-based application designed to simplify travel planning.
It helps users search destinations, plan routes, generate QR codes, and manage itineraries in a clean and user-friendly interface.

🚀 Live Demo
🔗[ Smart Trip Planner](https://smarttripplanner-production-657c.up.railway.app/)

🛠️ Tech Stack
🎨 Frontend: React + Vite

🖥️ Backend: Node.js (Express server)

🗺️ Libraries: Leaflet, React-Leaflet, Leaflet Routing Machine

📱 Utilities: html5-qrcode, qrcode.react

🔧 Tools: concurrently, vite-plugin-pwa

☁️ Deployment: Railway

📂 Project Structure
Code
smart_trip_planner/
│── frontend/         # React + Vite frontend code
│── backend/          # Node.js server files
│── public/           # Static assets
│── src/              # React source code (components, pages)
│── package.json      # Dependencies and scripts
│── vite.config.js    # Vite configuration
│── README.md         # Project documentation
⚡ Step-by-Step Guide
1️⃣ Clone the repository
bash
git clone https://github.com/satissh11/smart_trip_planner.git
cd smart_trip_planner
2️⃣ Install all dependencies
bash
npm run install-all
👉 This installs dependencies for root, frontend, and backend together.

3️⃣ Run the project locally
bash
npm run dev
👉 This will start both frontend (Vite) and backend (Node server).
Open http://localhost:5173/ in your browser.

4️⃣ Build frontend for production
bash
cd frontend
npm run build
👉 Generates optimized production build.

5️⃣ Deploy
Upload build files to Railway or any static hosting service.

Backend runs on Node.js server.

✨ Features
🗺️ Interactive maps with Leaflet + React-Leaflet

🛣️ Route planning using Leaflet Routing Machine

📱 QR code generation & scanning

⚡ Fast React frontend powered by Vite

🔄 Concurrently running frontend + backend

☁️ Deployed seamlessly on Railway

📸 Screenshots (to be added)
🏠 Homepage view

🗺️ Trip planner interface

📱 QR code feature

👨‍💻 Author
Satish Kumar

Sarala Birla University, Ranchi

Team: AI_Tracker

🏆 Acknowledgements
Institution’s Innovation Council, SBU

Tech Pragati 2026 Hackathon

Sponsors: Hotel The Plateau, SKODA Singhaniya Motors
