const axios = require("axios");
const express = require("express");
const app = express();
const bcrypt = require('bcrypt');

const http = require('http');
const { Server } = require("socket.io");
const { userInfo } = require("os");
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

const game = {};

app.use(express.static("public"));
app.use(express.json());

const QUOTABLE_API_URL = 'https://api.quotable.io/random?minLength=100&maxLength=150';

const users = [];

app.get('/user', (req, res) => {
    res.json(users);
    console.log(users);
});

app.post('/user', async (req, res) => {
    try {
        let username = req.body.username;
        let password = req.body.password;

        var found = false;
        for (var i = 0 ; i  < users.length; i++) {
            if (users[i].username === username)
                found = true;
        }
        // TODO check if username already exists
        if (
            typeof username !== "string" ||
            typeof password !== "string" ||
            username.length < 1 ||
            username.length > 20 ||
            password.length < 8 ||
            password.length > 20 ||
            found
        ) {
            // username and/or password invalid
            return res.status(401).send();
        }
        const hashedPassword = await bcrypt.hash(password, 10);    
        const user = { name: username, password: hashedPassword };
        users.push(user);
        res.send();
    } catch {
        res.status(500).send();
    }
});

app.post('/auth', async (req, res)  => {
    const user = users.find(user => user.name == req.body.username);
    if (user == null) {
        return res.status(400).send("Cannot find user");
    }

    console.log(req.body.password);
    console.log(user.password);
    bcrypt.compare(req.body.password, user.password)
    .then(function (isSame) {
        if (isSame) {
            // password matched
            res.status(200).send();
        } else {
            // password didn't match
            res.status(401).send();
        }
    })
    .catch(function (error) {
        console.log(error);
        res.status(500).send(); // server error
    });
});

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

server.listen(PORT, () => {
    console.log(`listening at: http://*:${PORT}`);
});