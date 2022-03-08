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

app.get("/quotable", function (req, res) {
    axios.get(QUOTABLE_API_URL).then(function (response) {
        res.status(200);
        res.json({"status": 200,
        "content": response.data.content,
        "len": response.data.length});
    }).catch(function () {
        res.status(400);
        res.json({"status": 400});
    });
});

io.on("connection", (socket) => {
    socket.on("create", function (raceId, userId, quote, charLen) {
        socket.join(raceId);
        console.log("user created room " + raceId);
        game[raceId] = {"quote": quote, 
        "charLen": charLen,
        "inProgress": false,
        "players": {}};
        game[raceId].players[userId] = {"progress": 0, "wpm": 0}; 
    });
    socket.on("join", function (raceId, userId) {
        if (game[raceId] === undefined) {
            socket.emit("join-quotable", "", true);
        } else if (game[raceId].inProgress) {
            socket.emit("join-quotable", game[raceId], false);
        } else {
            game[raceId].players[userId] = {"progress": 0, "wpm": 0};
            socket.join(raceId);
            socket.emit("join-quotable", game[raceId], false);
            console.log("user joined room " + raceId);
        };
    });
    socket.on("start", function (raceId, callback) {
        game[raceId].inProgress = true;
        socket.to(raceId).emit("receive-start");
        callback();
    });
    socket.on("send", function (raceId, userId, userData) {
        game[raceId].players[userId].progress = userData.progress;
        game[raceId].players[userId].wpm = userData.wpm;
        socket.to(raceId).emit("receive", game[raceId]);
    });
});

server.listen(port, () => {
    console.log(`listening at: http://*:${port}`);
});