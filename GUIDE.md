# 🚀 How to Run the Local AI Resume Analyzer

This application consists of three parts that must run simultaneously:
1. **Ollama** (The AI Model Provider)
2. **Backend** (Python Flask API)
3. **Frontend** (React User Interface)

## Prerequisites
- **Python 3.10+**
- **Node.js 18+** & `npm`
- **Ollama** installed from [ollama.com](https://ollama.com)

---

## 🟢 Step 1: Start Ollama
Open a terminal and run:
```bash
ollama serve
```
*Keep this terminal open.*

💡 **First Run Only:** Pull the model (Required):
```bash
ollama pull llama3
```

---

## 🐍 Step 2: Start Backend (Port 5001)
Open a **new** terminal:

1. Navigate to backend:
   ```bash
   cd backend
   ```
2. Create/Activate Virtual Environment:
   ```bash
   # Windows
   python -m venv venv
   .\venv\Scripts\Activate
   
   # Mac/Linux
   python3 -m venv venv
   source venv/bin/activate
   ```
3. Install Dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run the Server:
   ```bash
   python app.py
   ```
   ✅ You should see: `Running on http://127.0.0.1:5001`

---

## ⚛️ Step 3: Start Frontend (Port 5173)
Open a **new** terminal:

1. Navigate to frontend:
   ```bash
   cd frontend
   ```
2. Install Dependencies:
   ```bash
   npm install
   ```
3. Run Development Server:
   ```bash
   npm run dev
   ```
   ✅ You should see: `Local: http://localhost:5173`

---

## 🌐 Step 4: Use the App
Open your browser and go to: **[http://localhost:5173](http://localhost:5173)**

---

## 🛠 Troubleshooting

**Error: "An attempt was made to access a socket..."**
- Port 5000 is blocked. We configured the app to use **Port 5001** (in `.env`). Ensure you follow Step 2 correctly.

**Error: "Connection Refused" (API)**
- Check if Backend is running.
- Ensure Frontend uses `VITE_API_URL=http://localhost:5001` (Checked in `frontend/.env`).

**Error: "Ollama not found"**
- Ensure `ollama serve` is running.
- Ensure the model is downloaded (`ollama pull llama3`).
