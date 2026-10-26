# 🏨 HotelPro — Luxury Hotel Management & Booking Platform

HotelPro is a modern, full-stack luxury hotel management and booking web application built from scratch with **React (JavaScript / Vite)**, **Node.js**, **Express.js**, **MongoDB (Mongoose)**, and **Tailwind CSS**.

---

## 🌟 Key Features

### 1. Guest Experience & Public Homepage
* **Hero Carousel:** Dynamic image carousel showcasing featured luxury suites and villas with automatic transitions and manual controls.
* **About HotelPro Section:** Heritage, architectural design, Forbes 5-star hospitality, and curated resort amenities (infinity pool, Michelin-star dining, private yacht charters).
* **Rooms Catalog & Live Filters:** Search by keyword, filter by room type, price slider ($150–$1,200), minimum guests, and curated amenities checklist.
* **Room Details Modal:** Multi-image gallery with thumbnail switcher, comprehensive specs (size, bed configuration, capacity), and full amenities list.

### 2. User & Admin Portals
* **Role-Based Authentication:** JWT-based authentication with bcryptjs password hashing.
  * Ordinary Users → **UserHome** (`/user-home`): Personalized greeting, direct navigation, and embedded available rooms listing.
  * Administrators → **AdminHome** (`/admin-home`): Executive management suite with 4 dedicated tabs.
* **Strict Double-Booking Prevention:** Atomic date-overlapping conflict validation preventing conflicting reservations on the same room.
* **My Bookings:** Complete reservation history with booking reference, room details, dates, total amount, customer phone number, and one-click cancellation.
* **Admin Dashboard (4 Tabs):**
  * **Tab 1: All Bookings:** View all reservations across users, contact details, dates, total price, and status updater.
  * **Tab 2: All Rooms:** Inspect all rooms stored in MongoDB, with pricing, capacity, and amenities.
  * **Tab 3: Add Room:** Form to create and persist new luxury suites into MongoDB. Newly added rooms appear immediately in public catalog.
  * **Tab 4: All Users:** Display registered users (name, email, phone, role) with strict password security (no exposed hashes).

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 19 (JavaScript / JSX), Vite, Tailwind CSS, Lucide React, Axios |
| **Backend** | Node.js, Express.js, Mongoose, JWT (`jsonwebtoken`), `bcryptjs`, CORS, Dotenv |
| **Database** | MongoDB / MongoDB Atlas |

---

## 📁 Project Architecture

```
HotelPro/
├── backend/
│   ├── src/
│   │   ├── config/          # MongoDB connection via Mongoose
│   │   ├── controllers/     # Auth, Room, Booking controllers
│   │   ├── middleware/      # JWT protection & AdminOnly guards
│   │   ├── models/          # User, Room, Booking Mongoose schemas
│   │   ├── routes/          # Express REST API routes
│   │   ├── utils/           # Database seed script
│   │   └── server.js        # Express app entry point
│   ├── tests/               # Automated unit & workflow integration test suites
│   ├── .env.example
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/      # Navbar, Footer, RoomCard, Modals
    │   ├── context/         # AuthContext & ToastContext
    │   ├── pages/           # HomePage, UserHome, AdminHome, RoomsPage, MyBookingsPage, ProfilePage
    │   ├── services/        # Axios API client
    │   ├── App.jsx
    │   └── main.jsx
    ├── tailwind.config.js
    ├── vite.config.js
    └── package.json
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
* [Node.js](https://nodejs.org/) (v18 or higher)
* [MongoDB](https://www.mongodb.com/) (running locally or MongoDB Atlas URI)

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MONGODB_URI and JWT_SECRET
npm run rooms:refresh  # Creates/updates rooms without resetting accounts or bookings
npm start        # Starts Express server on http://localhost:5000
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
npm run dev      # Starts Vite React dev server on http://localhost:5173
```

Keep both the backend and frontend running in separate terminals. The frontend
forwards `/api` requests to `http://127.0.0.1:5000` during development. If rooms or
sign-in fail with a network error, check `http://localhost:5000/api/health` and
confirm MongoDB is running. In Windows PowerShell, use `npm.cmd` if `npm` is
blocked by the script execution policy.

For production, configure your web server to forward `/api` to the backend, or
set `VITE_API_URL` to the backend's public URL including `/api` before building.
See `frontend/.env.example`.

---

## Accounts and deployment

Public registration creates guest accounts. Demo sign-in shortcuts have been removed.
Previous local accounts and bookings were cleared, and a new local administrator
was created and verified. For another deployment, create an admin privately using `npm run admin:create` with the environment variables
listed in [DEPLOYMENT.md](DEPLOYMENT.md).

Follow [DEPLOYMENT.md](DEPLOYMENT.md) for hosting, configuration and submission checks.

---

## 🧪 Running Automated Tests

Run backend integration and workflow tests:
```bash
cd backend
node tests/test_suite.js
node tests/skillwallet_workflows_test.js
```

---

## 📄 License
MIT License. Crafted with excellence for HotelPro Hospitality.
