import { initializeApp } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyC_gtLqNtaHUCNl5j4E7Sl8x7bk-sBPJxI",
  authDomain: "altena-tools.firebaseapp.com",
  databaseURL: "https://altena-tools-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "altena-tools",
  storageBucket: "altena-tools.appspot.com",
  messagingSenderId: "966623467227",
  appId: "1:966623467227:web:2995c4247353f075751efe"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

console.log(database);