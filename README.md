# SafePass - Secure Password Manager

SafePass is a secure, client-side password manager built with Next.js, Firebase, and crypto-js. It allows users to sign in with their Google account, set a master password, and securely store their credentials. All encryption and decryption happens in the browser, ensuring the master password is never stored or transmitted.

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm or yarn

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd safepass-app
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Run the development server:**
    ```bash
    npm run dev
    ```

Open [http://localhost:9002](http://localhost:9002) with your browser to see the result.

## Key Technologies

- **Next.js**: React framework for building the user interface.
- **Firebase**: Handles user authentication (Sign in with Google) and data storage (Realtime Database).
- **crypto-js**: Used for AES encryption and decryption of credentials.
- **ShadCN/UI & Tailwind CSS**: For styling the application.

## How to Deploy

This application is ready to be deployed to a platform like Vercel or Firebase App Hosting.

### Deploying to GitHub

1.  **Initialize a Git repository**:
    ```bash
    git init -b main
    git add .
    git commit -m "Initial commit"
    ```
2.  **Create a new repository on GitHub** at [github.com/new](https://github.com/new).
3.  **Link and push your local repository**:
    ```bash
    git remote add origin <your-github-repository-url>
    git push -u origin main
    ```
