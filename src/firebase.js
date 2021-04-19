import firebase from 'firebase'

const firebaseConfig = {
  apiKey: "AIzaSyCh8YuaMsuPOca-PX4FZxIq9VvrGY9jvX8",
  authDomain: "cs247g-9d957.firebaseapp.com",
  projectId: "cs247g-9d957",
  storageBucket: "cs247g-9d957.appspot.com",
  messagingSenderId: "943697705504",
  appId: "1:943697705504:web:8dac44753753dba7405a45",
  measurementId: "G-8872W6HKMJ"
};


firebase.initializeApp(firebaseConfig);

export default firebase;