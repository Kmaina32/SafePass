
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBSOiOcgKrFfwhh0gRGhkfVGN2N70RMTEs",
  authDomain: "safepass-4assg.firebaseapp.com",
  databaseURL: "https://safepass-4assg-default-rtdb.firebaseio.com",
  projectId: "safepass-4assg",
  storageBucket: "safepass-4assg.appspot.com",
  messagingSenderId: "71051578574",
  appId: "1:71051578574:web:02f3159e8a3b879922149f"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getDatabase(app);
const storage = getStorage(app);

export { app, auth, db, storage };
