
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDF0jd_HXP_Gf2srWVJqwqZNCYcZGp5Nv4",
  authDomain: "lovable-chat-app.firebaseapp.com",
  databaseURL: "https://lovable-chat-app-default-rtdb.firebaseio.com",
  projectId: "lovable-chat-app",
  storageBucket: "lovable-chat-app.appspot.com",
  messagingSenderId: "558396358805",
  appId: "1:558396358805:web:6a101d24b56e736a9f2d40"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export const auth = getAuth(app);
