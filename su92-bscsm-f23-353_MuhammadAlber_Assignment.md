# **Full-Stack Project Documentation: FinPay Terminal Ecosystem**

**Full Name:** Muhammad Alber  
**Student ID:** su92-bscsm-f23-353  
**Instructor:** Syed Ahsan Shah  
**Course:** Full-Stack Web & App Development (Fintech Module)  
**Submission Date:** April 13, 2026

---

## **1. Executive Summary**
**FinPay** is a production-ready, full-stack fintech ecosystem comprising a **React (Vite)** web terminal, a **React Native (Expo)** mobile application, and a **FastAPI (Python)** backend. The system is engineered for high-security financial operations, featuring JWT-based authentication, administrative node control (account freezing), and automated PDF financial statements. This project adheres to Pakistani financial standards (PKR) and provides a seamless experience across web and mobile platforms.

---

## **2. Live Deployment & Access**
*Note: The entire ecosystem is deployed in a live cloud environment with a production-grade database handshake.*

| Component | Platform | Deployment Link (URL) |
| :--- | :--- | :--- |
| **Frontend Web** | Vercel | `https://fintech-app-ten-gray.vercel.app/` |
| **Backend API** | Render | `https://fintech-api-y5hn.onrender.com/docs` |
| **Mobile App** | Expo/EAS | `[Download Link for .apk]` |

---

## **3. Key Functional Features**

### **🛡️ Security & Authentication Suite**
*   **JWT Handshake:** All protected endpoints require a valid Bearer token for data access.
*   **OTP Verification:** A 4-digit mobile OTP layer for transaction authorization.
*   **Administrative Freezing:** Admins can instantly restrict any user account, blocking all API access in real-time.
*   **Session Guard:** 60-second inactivity logout protocol for the web terminal.

### **💼 Core Banking Operations**
*   **Tiered Limits:** Automatic enforcement of L1 (Rs. 50,000) and L2 (Rs. 500,000) monthly transaction caps.
*   **Smart Ledger:** A detailed transaction history with professional color-coding (**Green** for credits, **Red** for debits).
*   **PDF Engine:** One-click generation of official, computer-generated account statements using `fpdf2`.
*   **P2P Transfer:** Real-time balance updates with recipient validation and limit checks.

### **🕹️ Admin Command Console**
*   **System Metrics:** Live tracking of Total Users, System Transactions, and Total Volume (PKR).
*   **User Registry:** A master ledger for admins to manage balances, tiers, and account statuses.
*   **Node Restriction:** Instant "Freeze/Unfreeze" toggle for risk management.

---

## **4. Technical Stack & Architecture**

### **Frontend (Web & Mobile)**
*   **Web:** React.js (Vite) + Tailwind CSS + Lucide Icons.
*   **Mobile:** React Native (Expo) + NativeWind + React Navigation.
*   **API Client:** Centralized Axios/Fetch handler with Bearer token injection.

### **Backend (Microservice Layer)**
*   **Framework:** FastAPI (Python) with `uvicorn` and `gunicorn` for production.
*   **Security:** `PyJWT` for token generation and `python-dotenv` for secret management.
*   **Reporting:** `fpdf2` for dynamic PDF statement generation.

### **Database (Persistence)**
*   **Engine:** SQLite (`finpay.db`) with automated schema migrations.
*   **Schema:** Relational tables for `users` (auth, tiers, status) and `transactions` (linked by `user_id`).

---

## **5. Visual Project Evidence (Screenshots)**
*After converting this file to Word, please replace the text below with your actual project screenshots.*

### **A. Live Web Dashboard (Vercel)**
*(Insert screenshot of the dashboard at https://fintech-app-ten-gray.vercel.app/ showing the PKR balance)*

### **B. Admin Command Console (Production)**
*(Insert screenshot of the Admin Dashboard showing total system volume)*

### **C. Account Restriction (Frozen State)**
*(Insert screenshot showing the "ACCESS DENIED: Your account is restricted" alert)*

### **D. Automated PDF Statement**
*(Insert screenshot of the generated FinPay PDF account statement)*

### **E. Mobile App (Native Interface)**
*(Insert screenshot of the FinPay mobile app running on a device)*

---

## **6. Conclusion**
The **FinPay** ecosystem successfully bridges the gap between a modern UI and a secure, production-grade backend. It meets all the professional standards for a fintech application in Pakistan, including tiered security, administrative oversight, and official financial reporting. This submission represents a complete, functional prototype ready for production deployment.
