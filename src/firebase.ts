// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBRhCelIYkSXA_QGwq_xuNCAdPvdOtI_9Y",
  authDomain: "dunfermlinetaxi-654b6.firebaseapp.com",
  projectId: "dunfermlinetaxi-654b6",
  storageBucket: "dunfermlinetaxi-654b6.firebasestorage.app",
  messagingSenderId: "698177293245",
  appId: "1:698177293245:web:c7fc83c5385ce7002ce0d4",
  measurementId: "G-SZBD3R7T2F"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);