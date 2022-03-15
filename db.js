const firebase = require("firebase");
var config;

try {
    config = JSON.parse(process.env.CONFIG);
} catch (error) {
    config = require("./env.json");
}

firebase.initializeApp(config);
const db = firebase.firestore();
const User = db.collection("users");
module.exports = User;