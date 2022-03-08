const axios = require("axios");
const express = require("express");
const app = express();

const http = require('http');
const { Server } = require("socket.io");
const server = http.createServer(app);
const io = new Server(server);

const port = 3000;

const game = {};

app.use(express.static("public"));
app.use(express.json());

const QUOTABLE_API_URL = 'https://api.quotable.io/random?minLength=100&maxLength=150';

app.get("/quotable", (req, res) => {
    axios.get(QUOTABLE_API_URL).then((response) => {
        res.status(200);
        res.json({"status": 200,
        "content": response.data.content,
        "len": response.data.length});
    }).catch(() => {
        res.status(400);
        res.json({"status": 400});
    });
});

io.on("connection", (socket) => {
    socket.on("create", (lobbyId, userId, quote, charLen) => {
        socket.join(lobbyId);
        console.log("user created room " + lobbyId);
        game[lobbyId] = {"quote": quote, 
        "charLen": charLen,
        "inProgress": false,
        "players": {}};
        game[lobbyId].players[userId] = {"progress": 0, "wpm": 0, "accuracy": 100}; 
    });
    socket.on("join", (lobbyId, userId) => {
        if (game[lobbyId] === undefined) {
            socket.emit("join-quotable", "", true);
        } else if (game[lobbyId].inProgress) {
            socket.emit("join-quotable", game[lobbyId], false);
        } else {
            game[lobbyId].players[userId] = {"progress": 0, "wpm": 0, "accuracy": 100};
            socket.join(lobbyId);
            socket.emit("join-quotable", game[lobbyId], false);
            console.log("user joined room " + lobbyId);
        };
    });
    socket.on("send-joined-player", (playerNum, lobbyId, callback) => {
        socket.to(lobbyId).emit("receive-joined-player", playerNum);
        callback();
    });
    socket.on("start", (lobbyId, callback) => {
        game[lobbyId].inProgress = true;
        socket.to(lobbyId).emit("receive-start");
        callback();
    });
    socket.on("send-data", (lobbyId, userId, userData, callback) => {
        game[lobbyId].players[userId].progress = userData.progress;
        game[lobbyId].players[userId].wpm = userData.wpm;
        game[lobbyId].players[userId].accuracy = userData.accuracy;
        socket.to(lobbyId).emit("receive-data", game[lobbyId]);
        callback(game[lobbyId]);
    });
});

server.listen(port, () => {
    console.log(`listening at: http://*:${port}`);
});