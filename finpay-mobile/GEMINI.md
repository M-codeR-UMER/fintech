# Mobile App Implementation Plan: FinPay (React Native/Expo)

## 1. Background & Motivation
The objective is to create a fully functional, native mobile application (Android & iOS) for the FinPay project. This app must perfectly mirror the professional UI/UX of the existing React web application while introducing native mobile capabilities. The app will communicate with the existing FastAPI backend, ensuring data consistency across both platforms.

## 2. Scope & Impact
*   **Platform:** iOS and Android via React Native (Expo).
*   **UI/UX:** Exact replication of the web UI using NativeWind (Tailwind for React Native), including full Dark Mode support and complex animations (React Native Reanimated).
*   **Backend:** Integration with the existing `main.py` FastAPI server via `axios` or `fetch`.
*   **New Native Features:**
    1.  **Phone Contacts Integration:** Use `expo-contacts` to select recipients directly from the phone book for P2P transfers.
    2.  **Biometric Authentication:** Use `expo-local-authentication` (FaceID/TouchID) for secure app entry and transaction confirmation.
    3.  **Native QR Scanning:** Use `expo-camera` to scan QR codes for instant payments.
    4.  **Haptic Feedback:** Use `expo-haptics` to provide tactile feedback on button presses and successful transfers.
    5.  **Secure Storage:** Replace `localStorage` with `expo-secure-store` for encrypting user sessions and API tokens.
    6.  **Custom Splash Screen & Loading State:** A premium, branded splash screen featuring the FinPay logo (matching the web login screen). This will smoothly transition into a deliberate 2-second "Loading Wallet..." animation to make the app feel robust and professional during startup.
    7.  **Shareable Receipts:** Utilize `expo-sharing` to let users share successful transaction receipts via WhatsApp or other apps.
    8.  **Third-Party API Integration (Currency/Raast Simulation):** Integrate a free public API. Options include:
        *   **Exchange Rates API (Free tier):** Fetch live exchange rates (USD to PKR, EUR to PKR) to display a "Live Rates" ticker on the dashboard or virtual card screen.
        *   **Mock Bank/Raast Verification:** Since the official SBP Raast API requires enterprise credentials, we will build a mock "Raast Verification" step in the Python backend that mimics querying an external bank to resolve a phone number to an account title, making the app feel connected to the national switch.

## 3. Proposed Solution Architecture
1.  **Development Environment:** The mobile app will be built in a completely separate and isolated Node.js environment to prevent any conflicts with your existing web project. We will use the globally installed `create-expo-app` CLI.
2.  **Initialization:** Create a new directory `finpay-mobile` at the project root (`D:\fintech\finpay-mobile`). This folder will have its own independent `package.json` and `node_modules`.
3.  **Dependencies:** Install `nativewind`, `react-navigation`, and all necessary Expo SDK modules (`expo-contacts`, `expo-camera`, etc.) exclusively within this new directory.
4.  **UI & Color Consistency (Tailwind Strategy):** To guarantee the mobile app looks exactly like the website, I will copy your existing `tailwind.config.js` (including all custom brand colors, cyan gradients, and spacing) into the mobile project. NativeWind will map these exact classes (e.g., `text-brand-700`, `bg-slate-900`) to native mobile styles.
5.  **Folder Structure:** The mobile app will be structured identically to your web app for ease of maintenance:
    ```
    finpay-mobile/
    ├── src/
    │   ├── api/          # Axios/Fetch clients connecting to FastAPI
    │   ├── components/   # Reusable UI (Buttons, TransactionItem, Headers)
    │   ├── screens/      # Main views (Dashboard, Transfer, Account, Card)
    │   ├── navigation/   # Bottom Tab Bar setup
    │   └── theme/        # Shared constants and dark mode context
    ├── App.js            # Entry point & Navigation Container
    └── tailwind.config.js # Exact copy from web to ensure color consistency
    ```
5.  **API Client:** Recreate `src/api/client.js` in the mobile app, configured to point to the local network IP (e.g., `192.168.x.x:8001`) during development, and the production URL for the final build.
6.  **Screen Porting:** Rebuild the 5 core screens (Dashboard, Transfer, History, Card, Account) using mobile primitives (`<View>`, `<Text>`, `<ScrollView>`).
7.  **Build & Deploy:** Use Expo Application Services (EAS) to generate the final `.apk` file for the LMS submission.

## 4. Phased Implementation Plan
*   **Phase 0:** Save this entire plan document as `GEMINI.md` inside the `finpay-mobile/` directory. The Gemini CLI is instructed to read this file before performing any actions in the mobile app project to ensure strict adherence to this plan.
*   **Phase 1:** Initialize the Expo project (`npx create-expo-app finpay-mobile`) and configure NativeWind (Tailwind).
*   **Phase 2:** Build the Bottom Tab Navigation and port the core Dashboard UI.
*   **Phase 3:** Implement the API client and connect the Dashboard to real balance/transaction data.
*   **Phase 4:** Build the Transfer flow, integrating `expo-contacts` for recipient selection.
*   **Phase 5:** Add polish: Biometrics, Haptics, Dark Mode toggles, and Native QR scanning.
*   **Phase 6:** Testing and final APK generation.

## 5. Alternatives Considered
*   **PWA (Progressive Web App):** Rejected because the user specifically requested a native application with advanced features like Contacts integration and Biometrics, which are severely limited in a browser shell.
*   **Capacitor.js:** Rejected as the user preferred a dedicated native rewrite to ensure the highest quality and access to true native APIs rather than wrapping the web code.

## 6. Verification & Testing
To ensure the app works perfectly before submission, we will follow a rigorous **5-Times Revision and Testing Protocol** for every single feature (Dashboard, Transfer, API Calls, Biometrics, UI parity):
1.  **Initial Build Test:** Verify the code compiles and runs on the Expo Go app.
2.  **Backend Integration Test:** Send real requests to the local Python server and verify DB updates.
3.  **Edge Case Test:** Test failure states (e.g., trying to send more money than the balance, denying contact permissions).
4.  **Visual Parity Test:** Compare the screen side-by-side with the React web app to ensure 100% Tailwind color and spacing match.
5.  **Final User Acceptance Test (UAT):** You will scan the Expo QR code and physically test the feature on your own device before we mark it as complete.

## 7. Developer Instructions (Testing & Modifying)
To ensure you have full control over the mobile app for your assignment, follow these detailed instructions:

### A. How to Test the App Locally
1.  **Start the Backend:** Ensure your Python FastAPI server is running (`python main.py` in the `backend/` folder).
2.  **Start Expo:** Open a new terminal, navigate to `finpay-mobile/`, and run `npx expo start`.
3.  **Physical Device Testing:**
    *   Download the **Expo Go** app on your physical Android or iPhone.
    *   Connect your phone to the **same Wi-Fi network** as your computer.
    *   Scan the large QR code that appears in your terminal (use your camera app on iOS, or the scanner inside Expo Go on Android).
    *   The app will instantly bundle and open on your phone.

### B. How to Make Changes
1.  **Live Hot Reloading:** You do not need to restart the app to see changes. If you edit a file (e.g., changing text in `src/screens/Dashboard.js`), save the file, and your phone screen will update in less than a second.
2.  **Adding New Packages:** If you need a new feature, run `npx expo install [package-name]` inside the `finpay-mobile` directory.

### C. Building the Final APK (For LMS Submission)
1.  When you are ready to submit, stop the development server.
2.  Run `npx expo build:android -t apk` (Note: requires a free Expo account) OR use the local build command `npx expo run:android --device` to compile it directly.
3.  The output `.apk` file is what you will upload to your LMS alongside your Word file.
