# Modular IMS - Inventory Management System

A high-performance, premium inventory management system built with React, FastAPI, and Supabase.

## 🚀 Features

- **Real-time Dashboard**: Live KPIs, low-stock alerts, and activity tracking.
- **Secure Authentication**: Full login, signup, and password reset flows via Supabase.
- **Product Management**: Complete CRUD operations for inventory items with stock level monitoring.
- **Inventory Operations**:
  - **Receipts**: Track incoming stock with PDF export functionality.
  - **Deliveries**: Manage outgoing stock and customer shipments.
  - **Adjustments**: Manual stock corrections with a full audit trail.
- **Audit Logs**: Complete move history tracking every stock change.
- **Warehouse Settings**: Manage multiple locations and their capacities.
- **Modern UI**: Sleek, glassmorphic design with premium animations.

## 🛠️ Tech Stack

- **Frontend**: React, Vite, Vanilla CSS, Supabase JS Client, jsPDF.
- **Backend**: FastAPI, Python.
- **Database/Auth**: Supabase (PostgreSQL).

## 📦 Project Structure

```text
modular-ims/
├── frontend/        # React + Vite application
├── backend/         # FastAPI + Python backend
└── archive/         # Legacy project files
```

## ⚙️ Setup Instructions

### Frontend
1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```

### Backend
1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Set up a virtual environment and install dependencies (if applicable):
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   pip install -r requirements.txt
   ```
3. Run the API:
   ```bash
   uvicorn main:app --reload
   ```

## 📝 License
This project is for demonstration and development purposes.
