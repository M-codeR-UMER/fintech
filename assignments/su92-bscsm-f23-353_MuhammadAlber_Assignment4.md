pFull Name: Muhammad Alber  
Student ID / Roll Number: su92-bscsm-f23-353  
Instructor: Syed Ahsan Shah

***

# Assignment 4



**Q1: Which programming language will you select for your mobile front-end, and why does it suit your app?**

<!-- ![Front-end Framework](images/Screenshot%202026-04-03%20171224.png) -->

For a modern mobile banking application, I would select **Kotlin Multiplatform (KMP)** as the primary technology stack. This choice is based on several strategic advantages:

* **Shared Security Logic:** KMP allows us to write critical business and security logic (like encryption protocols and transaction validation) once in Kotlin and share it across both iOS and Android. This reduces the risk of logic discrepancies between platforms.
* **Native Performance:** Unlike hybrid frameworks, KMP allows the UI to remain 100% native (using SwiftUI for iOS and Jetpack Compose for Android), ensuring the highest performance and seamless integration with platform-specific biometrics.
* **Future-Proofing:** KMP is supported by Google and is increasingly favored by large-scale fintechs for its balance of development efficiency and native-level security.

**Q2: How will your application's Backend Layer utilize Internal and External APIs to connect seamlessly with banking core systems, such as Customer profiles, Transactions, and Payments?**

<!-- ![Transaction History APIs](images/Screenshot%202026-04-03%20171444.png) -->

The backend will function as a modular integration hub using two types of APIs:

* **Internal APIs:** These will connect our mobile app to the bank's microservices and legacy core systems. They will be optimized for speed and will handle the "Unified Customer View," ensuring that customer profiles are updated in real-time across all services.
* **External APIs:** These will be used for Open Banking and third-party integrations. For example, we will use external payment rails for real-time fund transfers (like FedNow or RTP) and connect to fintech partners for services like credit scoring or international currency exchange.
* **Orchestration:** The backend will use an event-driven architecture to ensure that a payment made through an API is immediately reflected in the transaction history and the customer's balance across the entire ecosystem.

**Q3: To protect sensitive financial data, how will you structure your Middleware Security Layer (including authentication, firewalls, and mobile security)?**

<!-- ![Security Gateway](images/app_screenshot.png) -->

The middleware security will follow a "Zero Trust" model with multiple protective layers:

* **Authentication:** Implementing OIDC (OpenID Connect) for secure identity management, combined with Adaptive Multi-Factor Authentication that challenges users based on risk factors like location or transaction size.
* **Firewalls:** Using a Web Application Firewall (WAF) specifically configured to block common banking threats (like bot attacks and SQL injection) before they reach the internal network.
* **Mobile-Specific Security:** Utilizing Runtime Application Self-Protection (RASP) to detect if the app is running on a rooted or jailbroken device. We will also implement certificate pinning to prevent "Man-in-the-Middle" attacks on the communication channel.

**Q4: How do you plan to expand your app's ecosystem by incorporating Smart Watch banking features like contactless payments, push messages, account balances, and card controls?**

<!-- ![Card Controls](images/Screenshot%202026-04-03%20171522.png) -->

Expanding to smartwatches will focus on providing "at-a-glance" utility and security:

* **Contactless Payments:** Using NFC and tokenization (via Apple Pay or Google Wallet) to allow users to pay at terminals using their watch without needing their phone or physical card.
* **Real-Time Push Messages:** Sending instant notifications to the wrist for all transactions, security alerts, or upcoming bill reminders to ensure immediate visibility.
* **Account Balances:** Implementing "Complications" (widgets) on the watch face that allow users to discreetly check their primary account balance with a single glance.
* **Card Controls:** Adding a "Remote Freeze" feature that allows a user to instantly block their card from their watch if they realize it is missing while they are on the go.
