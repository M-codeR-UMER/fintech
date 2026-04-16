# 🚀 FinPay: Full-Stack Fintech Ecosystem

![FinPay Banner](https://img.shields.io/badge/FinPay-Secure_Financial_App-0f7a6e?style=for-the-badge&logo=icloud&logoColor=white)

**FinPay** is a production-ready, full-stack fintech solution designed for the Pakistani market. It features a high-performance React web terminal, a native React Native mobile application, and a robust FastAPI backend. The ecosystem is engineered with a focus on security, scalability, and seamless cross-platform financial operations.

---

## 🌐 Live Deployments

| Platform | Deployment Link | Status |
| :--- | :--- | :--- |
| **Web Terminal** | [https://fintech-lilac.vercel.app/](https://fintech-lilac.vercel.app/) | ![Vercel](https://img.shields.io/badge/Vercel-Success-000000?style=flat-square&logo=vercel) |
| **Backend API** | [https://fintech-api-y5hn.onrender.com/docs](https://fintech-api-y5hn.onrender.com/docs) | ![Render](https://img.shields.io/badge/Render-Online-46E3B7?style=flat-square&logo=render) |

---

## ✨ Key Features

### 🛡️ Security & Authentication
- **JWT Authorization:** Secure, token-based access for all protected financial endpoints.
- **Node Restriction (Admin):** Admins can instantly **Freeze/Unfreeze** any account to block unauthorized transactions.
- **OTP Verification:** Simulated 4-digit mobile OTP for authorizing high-value transfers.
- **Inactivity Guard:** Automatic session termination after 60 seconds of idle time.

### 💼 Banking & Ledger
- **Tiered Accounts:** Automated monthly limits (L1: Rs. 50k, L2: Rs. 500k) based on account verification status.
- **PDF Statement Engine:** Generate professional, computer-generated financial statements in real-time.
- **Smart History:** Localized transaction ledger with PKR formatting and color-coded status indicators.
- **P2P Transfers:** Real-time balance synchronization and recipient validation.

### 🕹️ Administrative Command Console
- **System Health:** Live tracking of total users, transaction volume, and system switching metrics.
- **User Ledger:** Full management interface for account tiers, balances, and node statuses.

---

## 🛠️ Technical Stack

- **Frontend (Web):** React.js (Vite), Tailwind CSS, Lucide Icons.
- **Frontend (Mobile):** React Native (Expo), NativeWind, React Navigation.
- **Backend:** FastAPI (Python), Gunicorn (Production), Uvicorn.
- **Database:** SQLite (Relational Schema) with automated migrations.
- **Security:** PyJWT, Python-Dotenv.
- **Reporting:** FPDF2 (Dynamic PDF Generation).

---

## 🚀 Local Setup

### 1. Backend Setup
```bash
cd backend
pip install -r requirements.txt
python main.py
```

### 2. Web Frontend Setup
```bash
npm install
npm run dev
```

### 3. Mobile Frontend Setup
```bash
cd finpay-mobile
npm install
npx expo start
```

---

## ☁️ Deployment (Vercel + Render)

### 1. Deploy Backend on Render
- Create a new Web Service from this repo.
- Set **Root Directory** to `backend`.
- Build Command:
```bash
pip install -r requirements.txt
```
- Start Command:
```bash
gunicorn -w 2 -k uvicorn.workers.UvicornWorker main:app
```
- Add environment variables in Render:
	- `APP_ENV=production`
	- `SECRET_KEY=your-strong-secret`
	- `API_TOKEN=your-api-token` (optional; only if you enforce API token checks)

### 2. Deploy Web Frontend on Vercel
- Import this same repo in Vercel.
- Keep **Root Directory** as project root.
- Framework Preset: `Vite`
- Build Command: `npm run build`
- Output Directory: `dist`
- Add environment variables in Vercel:
	- `VITE_API_BASE_URL=https://your-render-service.onrender.com/api`
	- `VITE_API_TOKEN=your-api-token` (optional; only if backend token is enabled)

### 3. Redeploy After Changes
```bash
git add .
git commit -m "Configure API URL via environment vars"
git push origin master
```

Pushing to `master` triggers fresh deployments on both platforms if connected to Git.

---

## 📝 Assignment Information

- **Full Name:** Muhammad Alber
- **Student ID:** su92-bscsm-f23-353
- **Instructor:** Syed Ahsan Shah
- **Module:** Full-Stack Web & App Development (Fintech)

---

## 📄 License
This project is for academic purposes as part of the Fintech Module curriculum.

---
*Built with ❤️ by Muhammad Alber*
