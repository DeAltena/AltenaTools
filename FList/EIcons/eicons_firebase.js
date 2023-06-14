import { initializeApp } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-app.js";
import { getDatabase, ref, set, get } from "https://www.gstatic.com/firebasejs/9.21.0/firebase-database.js";

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

const path = "{USER}/eicons"
let dataRef = null

export function setUser(username) {
  dataRef = ref(database, path.replace("{USER}", username));
}

export function loadUserData(callback) {
  get(dataRef)
  .then((snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.val();
      callback(data);
      console.log('Data retrieved successfully:', data);
    } else {
      console.log('No data available.');
    }
  })
  .catch((error) => {
    console.error('Error retrieving data:', error);
  });
}

export function saveUserData(data) {
  if(dataRef === null){
    return false;
  }

  set(dataRef, data)
  .then(() => {
    $.toast('Data stored successfully.');
    console.log('Data stored successfully.');
  })
  .catch((error) => {
    $.toast('Error storing data!');
    console.error('Error storing data:', error);
  });

  return true;
}

//[eicon]sucktarded1[/eicon][eicon]sucktarded2[/eicon]
//[eicon]sucktarded3[/eicon][eicon]sucktarded4[/eicon]

export function saveTestData(){
  var data = {
    users: {
      user1: {
        name: "John",
        age: 25,
      },
      user2: {
        name: "Jane",
        age: 30,
      },
    }
  }

  set(dataRef, data)
  .then(() => {
    console.log('Data stored successfully.');
  })
  .catch((error) => {
    console.error('Error storing data:', error);
  });
}

export function readTestData(){
  get(dataRef)
  .then((snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.val();
      console.log('Data retrieved successfully:', data);
    } else {
      console.log('No data available.');
    }
  })
  .catch((error) => {
    console.error('Error retrieving data:', error);
  });
}