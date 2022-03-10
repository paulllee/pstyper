const firebase = require('firebase');

const config = {
    apiKey: "AIzaSyC25VRu7mCIRnC_p2GGgBZX3gZIUPRVvrw",
    authDomain: "pstyper-c2fcc.firebaseapp.com",
    projectId: "pstyper-c2fcc",
    storageBucket: "pstyper-c2fcc.appspot.com",
    messagingSenderId: "1096968805383",
    appId: "1:1096968805383:web:3fa657c14b741cffb55ea2",
    measurementId: "G-8XBSKV603V"
}
firebase.initializeApp(config);
const db = firebase.firestore();
const User = db.collection("users");
module.exports = User;