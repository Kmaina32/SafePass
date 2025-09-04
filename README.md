# SafePass - Secure Password Manager

SafePass is a secure, client-side encrypted password manager built with Next.js and Firebase. It provides a seamless and secure way for users to manage their credentials. All encryption and decryption happens in the browser, meaning your master password and unencrypted data are never sent to or stored on any server.

## Features

- **Secure User Authentication**: Sign up and sign in using Google or a traditional email and password.
- **Client-Side Encryption**: Your vault is secured with a master password that only you know. All your stored credentials are encrypted using AES (Advanced Encryption Standard) before being sent to the database.
- **Real-Time Data Sync**: Credentials are saved to Firebase Realtime Database and are instantly available across all your logged-in devices.
- **Full CRUD Functionality**: Add, view, update, and delete your passwords with an intuitive interface.
- **Password Visibility Toggle**: Show or hide passwords for easy copying and verification.
- **Responsive Design**: A clean, modern UI that works beautifully on both desktop and mobile devices, built with ShadCN/UI and Tailwind CSS.

## Technology Stack

- **Framework**: [Next.js](https://nextjs.org/) (with App Router)
- **Backend & Database**: [Firebase](https://firebase.google.com/) (Authentication & Realtime Database)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) & [ShadCN/UI](https://ui.shadcn.com/)
- **Encryption**: [crypto-js](https://www.npmjs.com/package/crypto-js) for robust AES encryption.
- **Form Management**: [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/) for validation.
- **UI State**: [React Firebase Hooks](https://github.com/CSFrequency/react-firebase-hooks) for easy integration with Firebase auth state.

## Getting Started

Follow these instructions to get a local copy of the project up and running.

### 1. Prerequisites

- [Node.js](https://nodejs.org/) (version 18 or later)
- `npm` (included with Node.js)

### 2. Clone the Repository

```bash
git clone https://github.com/Kmaina32/SafePass.git
cd SafePass
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Set Up Firebase

This is the most critical step. You need to create your own Firebase project to store user data.

1.  **Create a Firebase Project**: Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project.
2.  **Create a Web App**: In your new project, add a new Web App (`</>`). This will give you a `firebaseConfig` object.
3.  **Enable Authentication**:
    *   In the Firebase Console, go to **Authentication**.
    *   Click the **"Sign-in method"** tab.
    *   Enable both **Email/Password** and **Google** providers.
4.  **Configure Authorized Domains**:
    *   Still in Authentication settings, go to the **Settings** tab.
    *   Add `localhost` to the list of **Authorized Domains**.
5.  **Set Up Realtime Database**:
    *   Go to the **Realtime Database** section.
    *   Create a new database.
    *   Start in **Test Mode** for development. This allows reads and writes without complex security rules.

### 5. Configure the Application

- Open the file `src/lib/firebase.ts`.
- Replace the existing `firebaseConfig` object with the one you received from the Firebase console in Step 4.2.

### 6. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:9002](http://localhost:9002) in your browser to see the result.

## How to Deploy

This application is ready to be deployed to any platform that supports Next.js, such as [Vercel](https://vercel.com/) or Firebase Hosting.

**Important**: Before deploying, you must add your production URL (e.g., `your-app-name.vercel.app`) to the **Authorized Domains** list in your Firebase Authentication settings, just as you did for `localhost`.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
