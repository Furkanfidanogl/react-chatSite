# FeeChat

**FeeChat** is a real-time chat app built with **React**, **Vite**, and **Firebase**.  
Sign up, chat instantly, manage profiles, and track online status with a modern UI.

## Features

- Email/password authentication  
- Real-time messaging (Firestore)  
- Online/offline status updates  
- Profile management (avatar, bio, username)  
- Password reset via email  

## Tech Stack

- **Frontend:** React, Vite, TailwindCSS  
- **Backend:** Firebase Auth & Firestore  
- **Notifications:** react-toastify  

## Project Structure

- `src/components/` → Reusable UI components  
- `src/pages/` → App pages (Chat, Login, Profile, etc.)  
- `src/config/firebase.js` → Firebase initialization  
- `src/context/Context.jsx` → Global state management  

**Note:** Sensitive keys are stored locally in `.env` and **must not be committed**.
