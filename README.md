# Saarthi – MERN Stack

A full-stack **Saarthi** web application built with the **MERN stack** (MongoDB, Express.js, React.js, Node.js) that replicates core ride-booking functionality, including **real-time location tracking**, **ride requests**, **authentication**, vehicle selection, **OTP-based ride confirmation**, and separate dashboards for users and captains.

This project was created as a learning experience to understand full-stack development, API integration, and deployment workflows.

---

## 🌟 Features

-   User Authentication (Login / Signup)
-   Real-time Location Tracking (via Map APIs)
-   Book & Cancel Rides
-   Live Route Mapping
-   Protected Routes & JWT-based Auth
-   Clean UI using TailwindCSS
-   Full MERN Stack Integration

---

## 🏗️ Project Structure


saarthi/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── public/
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── hooks/
│       ├── context/
│       └── App.jsx
├── .gitignore
├── README.md
└── .env.example


---

## 💻 Tech Stack

### Backend
-   Node.js
-   Express.js
-   MongoDB
-   Socket.io
-   JWT Authentication

### Frontend
-   React.js (Vite)
-   Tailwind CSS
-   Leaflet (OpenStreetMap) – for map rendering & route visualization
-   Socket.io-client

---

## 🚀 Getting Started

### Prerequisites

-   Node.js (v18.x or higher)
-   npm
-   MongoDB (local or Atlas)

### Backend Setup
```bash
cd backend
npm install
npm run dev

### Frontend Setup
```bash
cd frontend
npm install
npm run dev

## API Integration
The frontend communicates with the backend through a RESTful API and real-time Socket.io events.

### Base URL:
http://localhost:4000

### Endpoints:
POST /api/auth/login – User/Captain login

POST /api/rides/request – User requests a ride

POST /api/rides/accept – Captain accepts a ride

### Real-time Events (Socket.io)
ride:request – emitted by user, received by captains nearby

ride:accept – emitted by captain, received by user

ride:update – live location & status updates

Full endpoint list is available in the routes/ folder of the backend.

## Development Workflow
-   User logs in and selects pickup & destination.

-   System suggests vehicle options (Auto / Bike / Car) and shows estimated fare.

-   User requests a ride → backend emits request to nearby captains via Socket.io.

-   Captain accepts → user receives driver details and an OTP.

-   Captain confirms OTP on pickup → ride starts.

-   Both parties see live updates; user rates the ride after completion.

## Environment Configuration
All sensitive credentials are stored in .env files. A .env.example file is provided to indicate the required variables.

Example: Backend (.env.example)


MONGO_URI=mongodb_connection_string
JWT_SECRET=your_jwt_secret
MAPBOX_API_KEY=your_mapbox_or_google_maps_key
PORT=4000


## Planned Improvements
-   Complete user-side map integration and live tracking.

-   Add fare estimation & surge pricing.

-   Implement payment gateway (Stripe) and trip receipts.

-   Add trip history and an analytics dashboard for captains.

-   Improve global state management and error handling.















