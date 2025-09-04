# **App Name**: SafePass

## Core Features:

- Add Password: Form to securely add and save website URL, username, and password, encrypted using the master password.
- Master Password: Input field for setting the master password which will be used to encrypt/decrypt all saved credentials.
- Password Encryption: Use crypto-js to encrypt user credentials with the master password before saving them to local storage.
- Password Decryption: Use crypto-js to decrypt the encrypted credentials from local storage into the application.
- Password List: Display the list of saved URLs and usernames, allowing the user to view (but not directly see) the password.
- Copy to Clipboard: Button to copy the decrypted password to the clipboard for a selected website.

## Style Guidelines:

- Primary color: Deep blue (#3F51B5) to convey security and trust.
- Background color: Light blue (#E8EAF6) for a clean, secure-feeling backdrop.
- Accent color: Teal (#009688) to highlight key actions and information.
- Body and headline font: 'Inter', a sans-serif font providing a modern, machined, objective, neutral look.
- Clean and minimal layout with clear visual hierarchy to emphasize ease of use.
- Simple and secure lock icons to represent encrypted data.