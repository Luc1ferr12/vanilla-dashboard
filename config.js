// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCtVKalCYsWX5eHfZyk005uzMElM_vreKo",
  authDomain: "data-pribadi-ac30b.firebaseapp.com",
  projectId: "data-pribadi-ac30b",
  storageBucket: "data-pribadi-ac30b.firebasestorage.app",
  messagingSenderId: "428995046107",
  appId: "1:428995046107:web:843f8c319c69c3812cfafe",
  measurementId: "G-KZVPHXVP7K" // Ini untuk Google Analytics, tidak wajib untuk Firestore
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
window.db = firebase.firestore();

console.log("Firebase initialized and Firestore service obtained from config.js."); // Log untuk debugging 