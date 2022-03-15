const firebase = require("firebase");
const config = require("./env.json");

firebase.initializeApp(JSON.parse(process.env.CONFIG) || config);
const db = firebase.firestore();
const User = db.collection("users");
module.exports = User;