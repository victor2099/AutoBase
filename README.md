# 🚗 AutoBase 

AutoBase is a modern, full-stack car rental application designed to streamline the vehicle booking process. Built entirely on the MERN stack, it provides a seamless user experience for customers looking to rent vehicles, alongside a powerful, protected administrative dashboard for managing the fleet, tracking bookings, and monitoring revenue.

## ✨ Key Features

**For Users:**
* 🔍 **Browse & Filter:** View available cars dynamically with details on pricing, category, and specifications.
* 📅 **Real-time Availability:** Prevent double-booking with overlapping date validation.
* 🔐 **Secure Authentication:** JWT-based user registration and login.

**For Administrators:**
* 📊 **Admin Dashboard:** High-level overview of system operations.
* 🚘 **Fleet Management:** Add, edit, or remove vehicles from the database.
* 🛡️ **Role-Based Access Control (RBAC):** Protected routes ensuring only authorized admins can modify fleet data.

## 🛠️ Tech Stack

**Frontend:**
* [React.js](https://reactjs.org/) - UI Library
* [Vite](https://vitejs.dev/) - Build Tool & Development Server
* [Axios](https://axios-http.com/) - Promise-based HTTP client
* [React Router v6](https://reactrouter.com/) - Application Routing

**Backend:**
* [Node.js](https://nodejs.org/) & [Express.js](https://expressjs.com/) - REST API Framework
* [MongoDB](https://www.mongodb.com/) & Mongoose - NoSQL Database & Object Data Modeling
* [JSON Web Tokens (JWT)](https://jwt.io/) - Stateless Authentication
* [Bcrypt.js](https://www.npmjs.com/package/bcryptjs) - Password Hashing

## 🚀 Getting Started

Follow these instructions to set up the project locally.

### Prerequisites
* Node.js installed on your machine.
* A MongoDB cluster (Atlas) or local MongoDB instance.

### Installation

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/your-username/AutoBase.git](https://github.com/your-username/AutoBase.git)
   cd AutoBase
   ```
2. **Install Backend Dependencies:
   ```bash
   cd backend
   npm install
   ```
3. **Install Frontend Dependencies:
   ```bash
   cd ../frontend/app
   npm install
   ```

### Environment Variables
This project uses a unified backend `.env` file that is shared with the Vite frontend. Create a `.env` file in the `/backend` directory and add the following:

```env
# Backend Variables (Hidden from Browser)
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key

# Frontend Variables (Exposed to Vite via VITE_ prefix)
VITE_API_URL=http://localhost:5000/api
```

### Running the Application
Start the backend server:
```bash
cd backend
npm run dev
```

Start the frontend Vite server:
```bash
cd frontend/app
npm run dev
```


## 📂 Project Structure

The project follows a modular, separation-of-concerns architecture:

```text
AutoBase/
├── backend/
│   ├── controllers/    # Route logic (authController, carController)
│   ├── middleware/     # JWT verification & admin checks
│   ├── models/         # Mongoose Database Schemas
│   ├── routes/         # Express API endpoints
│   └── index.js        # Entry point for the server
└── frontend/
    └── app/
        ├── src/
        │   ├── api/        # Axios utility functions
        │   ├── components/ # Reusable UI components
        │   ├── pages/      # Route pages (Home, AdminDashboard)
        │   └── App.jsx     # Main React application
        └── vite.config.js  # Vite configuration
```
