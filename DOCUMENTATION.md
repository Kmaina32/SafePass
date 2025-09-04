# Capstone Project: Getting Started with Firebase in a Next.js App
## A Beginner’s Guide to Secure, Cloud-Powered Web Applications

- **Student:** George K. Maina 
- **Technology Chosen:** Firebase (Authentication & Realtime Database) with Next.js
- **Reason for Choice:** To learn how to build secure, real-time, multi-user applications without managing a backend server. Firebase offers a powerful suite of tools that integrates well with modern frontend frameworks like Next.js.
- **End Goal:** To build a functional and secure password manager (SafePass) that leverages cloud authentication and a real-time database, with all sensitive data encrypted on the client-side.

---

## 2. Quick Summary of the Technology

- **What is it?** Firebase is a platform developed by Google for creating mobile and web applications. It provides a suite of tools to build, improve, and grow your app. We are focusing on two of its core services:
    - **Firebase Authentication:** A service that provides easy-to-use UI libraries and backend services to authenticate users. It supports social logins like Google, Facebook, and Twitter, as well as traditional email/password logins.
    - **Firebase Realtime Database:** A cloud-hosted NoSQL database that lets you store and sync data between your users in real time. Data is stored as JSON and synchronized across all connected clients.
- **Where is it used?** Firebase is widely used in startups and large companies alike for building scalable web and mobile apps quickly. Examples include apps for social media, real-time collaboration tools, online gaming, and on-demand services.
- **Real-world example:** **Alibaba** uses Firebase for its cloud messaging and real-time configuration services to engage with its massive user base.

---

## 3. System Requirements

- **OS:** Linux, macOS, or Windows.
- **Tools/Editors:** A code editor like VS Code is recommended.
- **Runtime Environment:** Node.js (version 18 or later).
- **Package Manager:** `npm` (which comes with Node.js) or `yarn`.

---

## 4. Installation & Setup Instructions

The setup process for this project involves initializing a Next.js application and then integrating Firebase.

1.  **Create a Next.js App:**
    ```bash
    npx create-next-app@latest safepass-app --typescript --tailwind --eslint
    cd safepass-app
    ```

2.  **Install Essential Libraries:** We need `firebase` for backend services, `react-firebase-hooks` to easily listen to auth state, and `crypto-js` for encryption.
    ```bash
    npm install firebase react-firebase-hooks crypto-js @types/crypto-js
    ```

3.  **Set up a Firebase Project:**
    - Go to the [Firebase Console](https://console.firebase.google.com/).
    - Click "Add project" and follow the on-screen instructions.
    - Once the project is created, navigate to **Project Settings** (click the gear icon).
    - Under the "General" tab, scroll down to "Your apps". Click the web icon (`</>`) to create a new web app.
    - Register your app and Firebase will provide you with a `firebaseConfig` object. **This is crucial.**

4.  **Add Firebase Config to Your App:**
    - Create a new file: `src/lib/firebase.ts`.
    - Paste your `firebaseConfig` object into this file and initialize Firebase, like so:
    ```typescript
    import { initializeApp, getApps, getApp } from "firebase/app";
    import { getAuth } from "firebase/auth";
    import { getDatabase } from "firebase/database";

    const firebaseConfig = {
      // Your config object from the Firebase console
      apiKey: "AIza...",
      authDomain: "your-project.firebaseapp.com",
      databaseURL: "https://your-project-default-rtdb.firebaseio.com",
      projectId: "your-project",
      storageBucket: "your-project.appspot.com",
      messagingSenderId: "...",
      appId: "..."
    };

    const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    const auth = getAuth(app);
    const db = getDatabase(app);

    export { app, auth, db };
    ```
5. **Enable Authentication and Database:**
    - In the Firebase Console, go to the **Authentication** section.
    - Click "Get started" and enable the **Google** sign-in provider.
    - Go to the **Realtime Database** section.
    - Click "Create database" and start in **test mode** (you can change security rules later).

---

## 5. Minimal Working Example

This project serves as the working example. The core logic for interacting with Firebase is in `src/components/safe-pass-container.tsx`.

-   **Expected Output:** A web page that prompts the user to "Sign in with Google". After signing in, first-time users are asked to create a master password. Returning users are asked to enter their master password to unlock their vault, where they can add, view, and delete encrypted credentials.

Here’s a snippet showing how we listen for the user's authentication state:
```typescript
// In src/components/safe-pass-container.tsx

// ...imports
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "@/lib/firebase";
import { ref, onValue, set } from "firebase/database";

export function SafePassContainer() {
  // ... other state variables

  const [user, loading] = useAuthState(auth); // Hook to get the current user

  useEffect(() => {
    // This effect runs when the user's auth state changes
    if (user) {
      // If user is logged in, get their data from Realtime Database
      const userRef = ref(db, `users/${user.uid}`);
      const unsubscribe = onValue(userRef, (snapshot) => {
        const data = snapshot.val();
        setUserData(data);
      });
      return () => unsubscribe(); // Clean up listener
    } else {
      // If user is logged out, clear all local state
      setUserData(null);
      setIsUnlocked(false);
    }
  }, [user]); // Dependency array ensures this runs only when `user` changes

  // ... rest of the component logic
}
```

---

## 6. AI Prompt Journal

This section documents my experience building this project with an AI coding assistant.

**Prompt 1:**
- **Prompt:** "How can I add Firebase authentication with Google Sign-In to my Next.js application?"
- **AI's Response Summary:** The AI provided the necessary steps to install Firebase, configure a project, create the `firebase.ts` file, and implement a sign-in button using `signInWithPopup`.
- **My Evaluation:** This was extremely helpful and saved a lot of time I would have spent reading documentation. It gave me a clear, actionable plan.

**Prompt 2:**
- **Prompt:** "I need to store user data in Firebase Realtime Database where each user can only access their own data. Show me how to structure the data and write it from my Next.js app."
- **AI's Response Summary:** The AI suggested structuring the database with a top-level `users` key, followed by each user's unique ID (`uid`). It provided code examples using `ref()` and `set()` from the Firebase SDK to write data to the correct user-specific path.
- **My Evaluation:** The suggested data structure was logical and scalable. The code examples were correct and easy to adapt.

**Prompt 3:**
- **Prompt:** "My app shows a hydration error in Next.js because I'm checking for a user on the client side. How do I fix this?"
- **AI's Response Summary:** The AI explained that the error occurs because server-rendered content (with no user) mismatches the initial client-rendered content (where the user is detected). It suggested using a custom `useMounted` hook to delay rendering of client-side-only components until after the component has mounted in the browser, showing a skeleton loader in the meantime.
- **My Evaluation:** This solved a complex issue that is common in server-rendered applications. The solution was elegant and followed best practices.

---

## 7. Common Issues & Fixes

-   **Issue:** `FirebaseError: Firebase: Error (auth/configuration-not-found)`.
-   **Cause:** This error almost always occurs if the domain you are running the app on (e.g., `localhost` or a cloud development URL) is not added to the "Authorized Domains" list in your Firebase project's Authentication settings. It can also happen if you forget to enable the sign-in providers (like Google or Email/Password).
-   **Fix:** In the Firebase Console, go to **Authentication -> Settings -> Authorized Domains** and add your development domain (e.g., `localhost` or the specific domain of your cloud development environment). Ensure your desired providers are enabled in the **Sign-in method** tab. It may take a few minutes for changes to apply.
    <br>
    **Example of correct configuration:**
    <br>
    <img width="700" alt="A screenshot showing the correct way to add domains to the Firebase authorized domains list. It shows 'localhost' and a cloud workstation domain, both without http prefixes or trailing slashes." src="https://storage.googleapis.com/static.aifor.dev/images/safepass_authorized_domains.png">
    <br>

-   **Issue:** Data is not being saved to the database, with no errors.
-   **Cause:** This is often due to Firebase Security Rules. If you initialized your database in "production mode," the default rules block all reads and writes.
-   **Fix:** For development, you can start in "test mode". For production, you must write rules that explicitly grant access. For example, to allow a user to read/write their own data:
    ```json
    {
      "rules": {
        "users": {
          "$uid": {
            ".read": "$uid === auth.uid",
            ".write": "$uid === auth.uid"
          }
        }
      }
    }
    ```

---

## 8. Version Control & Repository

- **Version Control:** This project uses Git for version control.
- **Project Repository:** The complete source code is available on GitHub. You can view it here: [https://github.com/Kmaina32/SafePass](https://github.com/Kmaina32/SafePass)
- **Author's GitHub:** You can find more of my work on my personal GitHub profile: [https://github.com/Kmaina32](https://github.com/Kmaina32)

---

## 9. License

This project is licensed under the MIT License. See the `LICENSE` file in the repository for the full text. This permissive license allows you to use, modify, and distribute the code freely, provided you include the original copyright notice.

---

## 10. References

-   **Official Docs:**
    -   [Next.js Documentation](https://nextjs.org/docs)
    -   [Firebase Documentation](https://firebase.google.com/docs)
    -   [crypto-js on npm](https://www.npmjs.com/package/crypto-js)
-   **Helpful Tutorials:**
    -   [Fireship.io - Get started with Firebase](https://www.youtube.com/watch?v=l_u-s_HhW1I)
    -   [Next.js and Firebase - The Full Course](https://fireship.io/courses/nextjs/)
