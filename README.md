# TokenFlow 🎟️

TokenFlow is a modern, real-time token and order management system built for cafes, restaurants, or any service that relies on a queue-based ordering system. It features a fast, interactive customer ordering interface, a worker dashboard to manage live orders, and a real-time public token display.

---

## ✨ Features

* **Customer Ordering Experience**: A sleek, user-friendly UI for customers to browse the menu, add items to a cart, and place orders.
* **Worker Dashboard**: A real-time, centralized control panel for staff to view incoming orders, update token statuses, and manage the live queue efficiently.
* **Live Token Display**: A dynamic public display showing tokens that are currently in queue ("Serving Soon") and tokens ready for pickup ("Now Serving").
* **Real-time Synchronization**: Powered by Socket.IO, ensuring instant updates across all connected clients without manual page refreshes.
* **Responsive Design**: Beautifully crafted with Tailwind CSS to look great on desktop displays, tablets, and mobile devices.

---

## 🛠️ Technology Stack

**Frontend**
* [React 19](https://react.dev/)
* [Vite](https://vitejs.dev/) - Lightning fast build tool
* [Tailwind CSS](https://tailwindcss.com/) - Utility-first styling
* [React Router](https://reactrouter.com/) - Client-side routing
* [Socket.IO Client](https://socket.io/) - Real-time websocket communication
* [Axios](https://axios-http.com/) - Promise-based HTTP client

**Backend**
* [Node.js](https://nodejs.org/) & [Express](https://expressjs.com/)
* [Prisma ORM](https://www.prisma.io/) - Next-generation Node.js and TypeScript ORM
* [SQLite](https://sqlite.org/) - Lightweight database for rapid development
* [Socket.IO](https://socket.io/) - Bidirectional, real-time communication

---

## 🚀 Getting Started

Follow these steps to get a local copy up and running.

### Prerequisites

* [Node.js](https://nodejs.org/) (v16 or higher recommended)
* npm (comes with Node.js)

### Installation

1. **Clone the repository** (if not already downloaded):
   ```bash
   git clone <repository-url>
   cd Token_System
   ```

2. **Setup the Backend**:
   ```bash
   cd backend
   npm install
   ```

3. **Configure Environment Variables**:
   In the `backend` directory, create a `.env` file and set the database URL:
   ```env
   DATABASE_URL="file:./dev.db"
   PORT=5000
   ```

4. **Initialize Database**:
   From inside the `backend` folder, run Prisma migrations to build the SQLite database:
   ```bash
   npm run prisma:generate
   npm run prisma:push
   ```

5. **Setup the Frontend**:
   Open a new terminal session.
   ```bash
   cd frontend
   npm install
   ```

---

## 💻 Running the Application

To run the application, you'll need two separate terminal windows for the frontend and backend.

**Terminal 1 (Backend)**
```bash
cd backend
npm run dev
```
*The backend server will start on http://localhost:5000*

**Terminal 2 (Frontend)**
```bash
cd frontend
npm run dev
```
*Vite will start the React application. Follow the CLI prompt or open http://localhost:5173 to view the app.*

---

## 📂 Project Architecture

```
Token_System/
│
├── backend/
│   ├── prisma/             # Database schema and SQLite DB file
│   │   └── schema.prisma   # Prisma models (Order, Token, MenuItem, etc.)
│   ├── src/                # Backend source code (Express app, Socket.IO config)
│   ├── .env                # Backend environment variables
│   └── package.json        # Backend dependencies & scripts
│
├── frontend/
│   ├── public/             # Static assets
│   ├── src/
│   │   ├── pages/          # React pages (CustomerOrder, WorkerDashboard, TokenDisplay)
│   │   ├── components/     # Reusable UI components
│   │   ├── App.jsx         # Defines app routing
│   │   └── index.css       # Tailwind entry and global styles
│   ├── index.html          # Vite entry HTML
│   ├── tailwind.config.js  # Tailwind CSS configuration
│   └── package.json        # Frontend dependencies & scripts
│
└── README.md
```

## 📜 License

Distributed under the ISC License.
