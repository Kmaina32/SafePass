
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  "projectId": "safepass-ckjal",
  "appId": "1:39534961530:web:2f4ea87be4a594cdbe2cc3",
  "storageBucket": "safepass-ckjal.firebasestorage.app",
  "apiKey": "AIzaSyAPZ9tzScl0DIazjRBnDWVOgM6PeJi83UY",
  "authDomain": "safepass-ckjal.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "39534961530",
  "databaseURL": "https://safepass-ckjal-default-rtdb.firebaseio.com"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app, {
  persistence: undefined,
  authDomain: firebaseConfig.authDomain,
});
const db = getDatabase(app);

export { app, auth, db };
