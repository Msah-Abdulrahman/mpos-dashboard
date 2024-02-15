// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDWbjpVT2Wpcl3LAwKDBrkBWfN5Vyr2kyU",
  authDomain: "mobile-pos-6d61e.firebaseapp.com",
  databaseURL: "https://mobile-pos-6d61e-default-rtdb.firebaseio.com",
  projectId: "mobile-pos-6d61e",
  storageBucket: "mobile-pos-6d61e.appspot.com",
  messagingSenderId: "74439766351",
  appId: "1:74439766351:web:0ebf6540f64565d300953a",
  measurementId: "G-K3MTYBG6M3"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
getAnalytics(app);
export const db = getFirestore(app);
