const firebase = require("firebase");
const config = require("./env.json");

firebase.initializeApp(process.env.config || config);
const db = firebase.firestore();
const User = db.collection("users");
module.exports = User;