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
    socket.on("create", function (id, quote, charLen) {
        socket.join(id);
        console.log("user created room " + id);
        game[id] = {"quote": quote, 
        "charLen": charLen,
        "inProgress": false};
    });
    socket.on("join", function (id) {
        if (game[id] === undefined) {
            socket.emit("join-quotable", "", true);
        } else if (game[id].inProgress) {
            socket.emit("join-quotable", game[id], false);
        } else {
            socket.join(id);
            socket.emit("join-quotable", game[id], false);
            console.log("user joined room " + id);
        };
    });
    socket.on("start", function (id, verified) {
        game[id].inProgress = true;
        socket.to(id).emit("receive-start");
        verified();
    });
});

server.listen(port, () => {
    console.log(`listening at: http://*:${port}`);
});