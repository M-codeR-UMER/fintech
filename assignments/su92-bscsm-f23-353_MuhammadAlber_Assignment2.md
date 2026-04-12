Full Name: Muhammad Alber  
Student ID / Roll Number: su92-bscsm-f23-353  
Instructor: Syed Ahsan Shah  

***

# Assignment 2

**Topic:** Digital Banking Architecture



**Q1: The conceptual architecture of digital banking consists of a Presentation Layer, a Middleware Layer, and a Backend Layer. Briefly explain the role of each layer.**

<!-- ![Banking Architecture - Presentation](images/Screenshot%202026-04-03%20171224.png) -->

Digital banking architecture is structured into three specialized layers to ensure both security and a smooth user experience:

* **Presentation Layer:** This is the user-facing "shopfront." Its role is to provide intuitive interfaces across multiple channels, such as mobile apps, web portals, and ATMs. It focuses on Customer Experience (CX) and initial input validation.
* **Middleware Layer:** This acts as the "orchestrator" or bridge. It decouples the front-end from the complex backend systems. Its roles include API management, identity authentication, data transformation (translating modern formats like JSON into legacy banking protocols), and coordinating complex workflows.
* **Backend Layer:** This is the "engine room" containing the Core Banking System (CBS). It handles the actual processing of financial transactions, manages interest and product logic, and maintains the central ledger and customer databases with high integrity.

**Q2: The Front End (Presentation Layer) is subdivided into Presentation Logic, Business Logic, and Data Logic. What is the purpose of these three distinct logic layers?**

<!-- ![UI Logic Example](images/Screenshot%202026-04-03%20171402.png) -->

Within the modern front-end architecture (such as a mobile app), logic is divided to ensure maintainability and performance:

* **Presentation Logic:** This handles the UI state and user interactions. Its purpose is to manage what the user sees, including animations, screen transitions, and responding to touch gestures.
* **Business Logic:** This layer enforces rules specific to the application's domain. In banking, this includes client-side data validation (e.g., ensuring an IBAN is correctly formatted) and performing simple calculations before sending data to the server.
* **Data Logic:** This manages how the app interacts with data sources. Its purpose is to handle API calls to the middleware, manage local caching for offline viewing, and maintain the app's overall data state.

**Q3: Within the Middleware Layer, how do the Security Layer (Authentication, Firewall, Mobile Security) and Integration Layer (Messaging, Processing Requests) operate?**

<!-- ![Authentication Middleware](images/app_screenshot.png) -->

These two components of the middleware ensure that banking operations are both safe and efficient:

* **Security Layer:** It operates as the "gatekeeper." Authentication modules verify user identity via MFA or biometrics. Web Application Firewalls (WAF) protect against banking-specific threats like SQL injection. Mobile security protocols, such as certificate pinning, ensure that the connection between the app and the server remains untampered.
* **Integration Layer:** It operates as the "central nervous system." It uses an API Gateway to provide a single entry point for all requests. Messaging systems (like Kafka) handle asynchronous tasks, while the processing engine orchestrates complex requests that require data from multiple backend systems, ensuring a unified response to the user.

**Q4: Why is it necessary for banks to spend approximately 10% of their budget specifically on Cyber Security?**

<!-- ![Secured Virtual Card](images/Screenshot%202026-04-03%20171522.png) -->

Allocating roughly 10% to 12% of the IT budget to cybersecurity has become the global industry standard for several critical reasons:

* **High-Value Targets:** Financial institutions are attacked 300 times more often than other sectors due to their liquid assets and sensitive data.
* **Cost of Breach:** The average cost of a data breach in banking is nearly $6 million. This is significantly higher than the cost of prevention.
* **Regulatory Compliance:** Strict laws like GDPR and DORA mandate high security standards. Failure to comply can result in massive fines and the loss of operating licenses.
* **Trust and Reputation:** Banking is built on trust. A single major breach can lead to a permanent loss of customers and institutional stability, making security spending a mandatory investment in brand survival.
