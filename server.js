const axios = require("axios");
const express = require("express");
const res = require("express/lib/response");
const app = express();

const http = require('http');
const { Server } = require("socket.io");
const server = http.createServer(app);
const io = new Server(server);

const port = 3000;

app.use(express.static("public"));
app.use(express.json());

const QUOTABLE_API_URL = 'https://api.quotable.io/random?minLength=100&maxLength=150';

app.get("/quotable", function(req, res) {
    axios.get(QUOTABLE_API_URL).then(function (response) {
        res.status(200);
        res.json({"status": 200,
        "content": response.data.content,
        "author": response.data.author,
        "len": response.data.length});
    }).catch(function () {
        res.status(400);
        res.json({"status": 400});
    });
});

io.on("connection", (socket) => {
    socket.on("create", function(id) {
        socket.join(id);
        console.log("user created room " + id);
    });
    socket.on("join", function(id) {
        if (io.sockets.adapter.rooms.get(id) === undefined) {
            console.log("INVALID ID");
        } else {
            socket.join(id);
            console.log("user joined room " + id);
        }
    })
});

server.listen(port, () => {
    console.log(`listening at: http://*:${port}`);
});