# Innovation Cell NIT Kurukshetra (ICell NITKKR) Platform

A full-stack web application for managing the Innovation Cell at NIT Kurukshetra. This platform handles student memberships, roles, events, attendance, blogs, photo galleries, newsletters, and certificates.

## 🚀 Tech Stack

### Frontend
- **Framework:** React 19 (via Vite)
- **Routing:** React Router v7
- **Styling:** Tailwind CSS v4
- **Animations:** Framer Motion & Lottie React
- **Utilities:** PDF-lib, Axios, Lucide React

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB
- **Authentication:** JWT (JSON Web Tokens) & bcryptjs
- **File Uploads:** Multer & Cloudinary
- **Emails/Newsletters:** Mailjet
- **Utilities:** CSV Parser, express-rate-limit, helmet, uuid

## ✨ Key Features

- **Role-Based Access Control (RBAC):** comprehensive 4-tier hierarchy (`student`, `member`, `post_holder`, `admin`).
- **Event Management:** Create and manage events, track attendance.
- **Blog System:** Submit, review, approve, and publish blogs.
- **Gallery & Albums:** Cloudinary-backed photo gallery and event albums.
- **Newsletters:** Distribute and track newsletter outreach to members.
- **Certificates:** Automated certificate generation and batch issuance for events and post holders.

## 📂 Project Structure

```
icell-nitkkr/
├── frontend/                # React (Vite) Frontend Application
│   ├── src/                 # Application source code
│   ├── public/              # Static assets
│   ├── package.json         # Frontend dependencies and scripts
│   └── vite.config.js       # Vite configuration
│
├── backend/                 # Main Node.js/Express Backend
│   ├── config/              # Database and environment configs
│   ├── controllers/         # Request handlers and business logic
│   ├── middleware/          # Express middleware (Auth, Admin checks, etc.)
│   ├── models/              # MongoDB Schemas and Models
│   ├── routes/              # API route definitions
│   ├── scripts/             # Utility and maintenance scripts
│   ├── index.js             # Express application entry point
│   └── package.json         # Backend dependencies and scripts
│
└── RBAC_ANALYSIS.md         # Detailed security and access control documentation
```

## 🛠️ Getting Started

### Prerequisites

- Node.js (v18+)
- MongoDB (Local or Atlas)
- Cloudinary Account
- Mailjet Account

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up your `.env` variables (copy `.env.example` to `.env` and fill the variables).
4. Start the development server:
   ```bash
   npm run dev
   ```
   *The backend will run on `http://localhost:5000`*

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
   *The frontend will run on `http://localhost:5173`*

## 🔒 Security & Authorization

This system is built with a granular Role-Based Access Control system. Make sure to refer to [`RBAC_ANALYSIS.md`](./RBAC_ANALYSIS.md) for more details on user promotion, token generation, and the middleware checks required for various API routes.

## 📝 Scripts

### Backend
- `npm start`: Runs the production server using node.
- `npm run dev`: Starts the server with Nodemon for development.

### Frontend
- `npm run dev`: Starts the Vite development server.
- `npm run build`: Builds the app for production.
- `npm run lint`: Lints the frontend codebase.
- `npm run preview`: Locally previews the production build.