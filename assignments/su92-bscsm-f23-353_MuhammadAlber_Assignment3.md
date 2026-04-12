Full Name: Muhammad Alber  
Student ID / Roll Number: su92-bscsm-f23-353   
Instructor: Syed Ahsan Shah

***

# Assignment 3

**Topic:** Mobile Banking Challenges and Chatbots



**Q1: What are the fundamental differences between Native Apps, Web Apps, and Hybrid Apps?**

<!-- ![Mobile App Interface](images/app_screenshot.png) -->

Choosing the right application type is critical for a bank's strategy:

* **Native Apps:** These are built specifically for one platform (iOS or Android) using languages like Swift or Kotlin. They offer the highest performance, full access to device hardware (like biometric sensors), and the best offline experience, though they are more expensive to develop.
* **Web Apps (PWAs):** These run through a mobile browser. They are cost-effective and cross-platform, but they have limited access to hardware features and typically offer lower performance compared to native applications.
* **Hybrid Apps:** These are a middle ground, using web technologies (HTML/JS) inside a native "wrapper." They allow for a single codebase across platforms and have better hardware access than web apps, though they may still experience some performance "jank" in complex interfaces.

**Q2: Building native apps is known to be costly. What are the other major challenges of mobile banking, such as screen size limitations, navigation issues, and multitasking constraints?**

<!-- ![UI Design Challenges](images/Screenshot%202026-04-03%20171402.png) -->

Beyond development costs, mobile banking faces significant UX and technical hurdles:

* **Screen Size & Density:** Designers must fit complex financial data (like investment charts) onto small screens without cluttering the interface. Elements must be large enough for "fat finger" accessibility while keeping critical information "above the fold."
* **Navigation Complexity:** Banking apps have deep hierarchies (Accounts, Payments, Loans). Keeping navigation within the "thumb zone" (the bottom third of the screen) while ensuring users can reach key tasks in 2-3 taps is a constant challenge.
* **Multitasking Constraints:** Mobile users are often interrupted. Banking apps must handle session timeouts for security while trying to preserve the user's state so they don't have to restart a complex transaction after switching apps.
* **Connectivity Anxiety:** Users expect immediate feedback on transactions. Designing for unstable 4G/5G connections requires robust error handling and "read-only" offline modes.

**Q3: What are the primary advantages of integrating chatbots into mobile banking, such as 24/7 availability, cost-efficiency, and reduced human error?**

<!-- ![Data Access via Bot](images/Screenshot%202026-04-03%20171444.png) -->

Chatbots have become a cornerstone of modern digital banking for several reasons:

* **24/7 Availability:** Chatbots provide instant support at any time, eliminating wait times for customers across different time zones without the need for overnight human staffing.
* **Cost-Efficiency:** Once deployed, chatbots can handle thousands of concurrent queries at a fraction of the cost of a live agent, allowing banks to scale support without linearly increasing headcount.
* **Reduced Human Error:** Bots pull data directly from core systems, ensuring that information like interest rates or balances is always accurate. They also follow strict compliance protocols, ensuring that mandatory disclosures are never missed.

**Q4: Differentiate between Task-Oriented chatbots and Data-Driven chatbots (which handle features like spending analysis, predictive capabilities, and risk management).**

<!-- ![Data-Driven Analytics](images/Screenshot%202026-04-03%20171444.png) -->

The sophistication of banking chatbots varies based on their underlying technology:

* **Task-Oriented Chatbots:** These are rule-based systems designed for high-volume, low-complexity tasks. They follow structured decision trees to help users with specific actions, such as checking a balance, activating a card, or locating the nearest ATM.
* **Data-Driven Chatbots:** These act as advanced virtual financial assistants using Machine Learning (ML). They analyze historical data to provide proactive insights, such as warning a user about an upcoming bill or suggesting a budget because they spent more on dining than usual. They can handle complex, natural language conversations and offer predictive financial advice.
