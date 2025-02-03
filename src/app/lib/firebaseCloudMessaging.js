// app/lib/firebaseCloudMessaging.js
import { initializeApp } from "firebase-admin/app";
import { getMessaging } from "firebase/messaging";



// Your web app's Firebase configuration (replace with your actual values)
const firebaseConfig = {
  apiKey: "AIzaSyBdmdRqk9PblOBOyjHlPFP7lDq0RSrodM4",
  authDomain: "tcmc-ac38a.firebaseapp.com",
  projectId: "tcmc-ac38a",
  storageBucket: "tcmc-ac38a.firebasestorage.app",
  messagingSenderId: "486439318975",
  appId: "1:486439318975:web:ac3bce8ec1f6f24bbedd0a",
  measurementId: "G-7G8S98E2CV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export { messaging }; 
