# FinPay: Project Status & Technical Documentation

## 🚀 Project Overview
**FinPay** is a high-performance, full-stack fintech solution consisting of a **React (Vite)** web application and a **React Native (Expo)** mobile application, both connected to a robust **FastAPI (Python)** backend with an **SQLite** database.

---

## ✅ Major Updates (Completed)

### 1. 🛡️ Security & Authentication Suite
*   **Dual-Platform Auth:** Implemented identical, secure Login/Registration flows on Web and Mobile.
*   **OTP Verification:** Simulated 4-digit OTP system for regular users (via browser/native alerts) to ensure secure terminal access.
*   **Inactivity Timer:** Global session monitoring that automatically logs out users after **1 minute of inactivity** for maximum security.
*   **Admin Bypass:** Streamlined access for Super Admins by bypassing OTP requirements.

### 2. 👥 Super Admin & System Terminal
*   **Restricted Dashboard:** A dedicated Admin terminal to oversee system health.
*   **Live Metrics:** Real-time tracking of Total Users, System Operations, and Total Switching Volume (PKR).
*   **User Registry:** A master ledger displaying all user IDs, Tiers (L1/L2), and current wallet balances.
*   **Credentials:** Default Admin access via `admin@finpay.com` / `admin123`.

### 3. 📱 Mobile-Native Capabilities
*   **Expo SDK Integration:** Built a separate native app directory (`finpay-mobile/`).
*   **Biometric Security:** Integrated Fingerprint and FaceID unlocking.
*   **Contact Syncing:** Real-time access to phone contacts for peer-to-peer transfers.
*   **Top Up Engine:** Native modal for loading funds from Pakistani Banks and Wallets (JazzCash, SadaPay, etc.).

### 4. 🎨 Professional UI/UX Overhaul
*   **Fluid TopBar:** Removed static hard lines; implemented transparent, glassy navigation that adapts to Light/Dark modes.
*   **Consistent Aesthetic:** Meticulously synced colors, gradients (`#0f7a6e` to `#07a3c2`), and translucent boxes across both platforms.
*   **Account Screen:** Redesigned with premium gradient profile cards, functional sub-tabs (Security, Notifications), and persistent avatar uploads.
*   **PKR Compliance:** Global enforcement of `Rs.` prefixing and Pakistani comma separation formatting.

---

## 🛠️ Technical Fixes (Resolved)
*   **Z-Index bug:** All modals now correctly overlay the TopBar (`z-150` vs `z-100`).
*   **Navigation bug:** Home tab now correctly resets action states and closes active modals.
*   **Title bug:** Document titles now update dynamically (e.g., `FinPay | Home`) and reset correctly on logout.
*   **Spacing:** Balanced vertical padding between TopBar and content for better layout breathing room.

---

## 📋 Ongoing & Planned (Phase 5+)
1.  **Backend User Isolation:** Strict filtering of all API data by authenticated `user_id` (In Progress).
2.  **Live Statements:** Generating downloadable PDF transaction histories.
3.  **Real Raast Integration:** Simulating the national switch for phone-to-account resolution.
4.  **EAS Deployment:** Generating final `.apk` bundles for production testing.

---

**Last Updated:** April 13, 2026  
**Developer:** Muhammad Alber (su92-bscsm-f23-353)  
**Instructor:** Syed Ahsan Shah
