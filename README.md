# Silver House

A full-stack e-commerce application specializing in premium silver artifacts, coins, idols, jewelry, spiritual items, and home decor. Built with a modern React frontend and a Node.js Express API backend connected to Microsoft SQL Server.

---

## 🌟 Key Features

### 🛍️ Frontend (React Storefront)
- **Home Page**: Dynamic hero banners, curated category cards, promotional banners, and featured product showcases.
- **Product Listing Page (PLP)**: Responsive product grid with category/subcategory filtering, sorting, and live status badges.
- **Product Detail Page (PDP)**: Interactive product view featuring image galleries, quantity selection, detailed specifications, and review highlights.
- **Cart & Wishlist**: Slide-out drawers with luxury CSS keyframe animations (`slideInRight`), promo code application, and interactive checkout modal.
- **Search & Quick View**: Modal search for fast discovery and quick view preview for rapid product evaluation.
- **Cinematic UI**: Global scroll-reveal effects, staggered component loading, shimmer gradients, and modern marquee components.
- **Toast Notification System**: Real-time feedback for adding items to cart, wishlist updates, and form submissions.
- **Responsive Design**: Designed with Tailwind CSS v4 and Lucide React Icons for a seamless mobile and desktop experience.

### ⚙️ Backend (Node.js & Express API)
- **RESTful Endpoints**: Unified API route structure (`/api/data`, `/catalog`) interacting with Microsoft SQL Server stored procedures.
- **Stored Procedure Integration**: Handles data queries, status verification, JSON payload parsing, and parameter binding (`dbo.SP_GETDATA` & `dbo.SP_Fetchdata`).
- **Persistent Image Storage**: Media uploads correctly migrate to the dedicated `Backend/product_image` directory to persist safely and prevent ephemeral hosting data loss.
- **Admin & Management Views**: Serves static HTML utilities (`public/index.html`, `public/catalog.html`, `public/product-form.html`) for product catalog management.
- **Proxy Configuration**: Supports dynamic rewrite mappings via `vercel.json` and `vite.config.js` for serving local backend assets (e.g., `/docs` and `/product_image`) through the frontend securely.

---

## 🛠️ Tech Stack

### **Frontend**
- **Framework**: React 19 + Vite
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React
- **Linter**: Oxlint

### **Backend**
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database Driver**: `mssql` (`msnodesqlv8` for ODBC / Windows Authentication)
- **Database**: Microsoft SQL Server

---

## 📁 Repository Structure

```
SilverHouse/
├── src/                        # React Frontend Source
│   ├── components/             # UI Components
│   │   ├── cart/               # CartDrawer & CheckoutModal
│   │   ├── common/             # Header, Footer, Modals, AnnouncementBar
│   │   ├── home/               # HomePage & Hero sections
│   │   ├── pdp/                # Product Detail Page components
│   │   ├── plp/                # Product Listing Page components
│   │   └── wishlist/           # WishlistDrawer
│   ├── data/                   # Mock & initial dataset definitions
│   ├── services/               # API service handlers
│   ├── App.jsx                 # Main application & routing logic
│   └── index.css               # Global CSS & Tailwind imports
├── Backend/                    # Node.js & Express Server
│   ├── public/                 # Static HTML views & admin management tools
│   ├── product_image/          # Persistent local storage for product image uploads
│   ├── .env                    # Environment variables configuration
│   ├── db.js                   # MS SQL Server database connection pool
│   └── server.js               # Express API endpoints & server setup
├── package.json                # Frontend dependencies & scripts
├── vercel.json                 # Production API routing & URL rewrites
└── README.md                   # Project documentation
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [Microsoft SQL Server](https://www.microsoft.com/sql-server) installed & running locally (or remote server access)
- [ODBC Driver 17 for SQL Server](https://learn.microsoft.com/sql/connect/odbc/download-odbc-driver-for-sql-server) (for Windows Authentication)

---

### 1. Frontend Setup

1. Install root dependencies:
   ```bash
   npm install
   ```

2. Start the Vite development server:
   ```bash
   npm run dev
   ```
   The frontend app will run at `http://localhost:5173`.

3. Build for production:
   ```bash
   npm run build
   ```

---

### 2. Backend Setup

1. Navigate to the `Backend` directory:
   ```bash
   cd Backend
   ```

2. Install backend dependencies:
   ```bash
   npm install
   ```

3. Create or configure `Backend/.env`:
   ```env
   PORT=5000
   DB_SERVER=.\SQLEXPRESS
   DB_NAME=SilverHouse
   DB_USER=
   DB_PASSWORD=
   ```
   *(Leave `DB_USER` and `DB_PASSWORD` blank if using Windows Trusted Connection)*

4. Start the backend server:
   ```bash
   node server.js
   ```
   The backend API will run on `http://localhost:5000`.

---

## 📡 API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/data` | Single unified endpoint executing `dbo.SP_GETDATA` for all entity queries, products, categories & mutations. |
| `GET` | `/catalog` | Serves the static HTML product catalog view (`catalog.html`). |

---

## 📜 Available Scripts

In the project root:
- `npm run dev` - Launches the Vite development server.
- `npm run build` - Builds the React app for production.
- `npm run preview` - Previews the production build locally.
- `npm run lint` - Runs Oxlint to check for code quality issues.

