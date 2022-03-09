const socket = io();
const buttonDiv = document.getElementById("button-container");
const timerDiv = document.getElementById("timer");
const linkDescDiv = document.getElementById("link-desc");
const linkDiv = document.getElementById("link");
var charNum = 0;
var lobbyId, userId;
var winner = null;

socket.on("connect", () => {
    userId = socket.id;
    let queryId = window.location.search.substring(4);

    if (queryId === "") {
        lobbyId = generateId();
        linkDescDiv.innerText = "invite your friends with this link:";
        linkDiv.innerText = "http://*/multi.html?id=" + lobbyId;
        updatePlaceholderForLobbyString(1);
        createMultiplayerQuotable();
        createStartButton();
    } else {
        lobbyId = queryId;
        socket.emit("join", lobbyId, userId);
    };

    socket.on("join-quotable", (game, error) => {
        joinMultiplayerQuotable(game, error);
    });

    socket.on("receive-joined-player", (playerNum) => {
        updatePlaceholderForLobbyString(playerNum);
    })
    
    socket.on("receive-start", () => {
        startCountdown();
    });

    socket.on("receive-data", (game) => {
        updateMultiplayerScoreboard(game);
    });
});

function updatePlaceholderForLobbyString(playerNum) {
    let lobbyString = playerNum + " player(s) joined the lobby [including yourself]";
    input.setAttribute("placeholder", lobbyString);
    input.addEventListener("blur", () => {input.setAttribute("placeholder", lobbyString)});
    input.addEventListener("focus", () => {input.setAttribute("placeholder", lobbyString)});
};

function startGame() {
    input.readOnly = false;

    input.setAttribute("placeholder", "click here to focus");
    input.addEventListener("blur", () => {input.setAttribute("placeholder", "click here to focus")});
    input.addEventListener("focus", () => {input.setAttribute("placeholder", "start typing...")});

    input.focus(); 
    
    input.removeEventListener("input", updateSingleplayerGameState);
    input.addEventListener("input", updateMultiplayerGameState);
};

function updateMultiplayerGameState() {
    startTimer();

    const quoteSpanArray = quoteDiv.querySelectorAll("span");
    const inputArray = input.value.split("");

    updateCharacters(quoteSpanArray, inputArray);
    updateIfTenCharsTyped(inputArray);
    updateIfMultiplayerGameDone(quoteSpanArray, inputArray);
};

function updateIfTenCharsTyped(inputArray) {
    if (++charNum % 10 === 0) {
        let curProgress = Math.floor((inputArray.length / charLength) * 100);
        let userData = {"progress": curProgress, "wpm": getWpm(), "accuracy": getAccuracy()};
        socket.emit("send-data", lobbyId, userId, userData, (game) => {
            updateMultiplayerScoreboard(game);
        });
    };
};

function updateIfMultiplayerGameDone(quoteSpanArray, inputArray) {
    if (isGameDone(quoteSpanArray, inputArray)) {
        stopTimer();
        let userData = {"progress": 100, "wpm": getWpm(), "accuracy": getAccuracy()};
        socket.emit("send-data", lobbyId, userId, userData, (game) => {
            updateMultiplayerScoreboard(game);
        });
        incorrect = 0;
        input.readOnly = true;
    };
};

function createStartButton() {
    let button = document.createElement("button");
    button.classList.add("start");
    button.setAttribute("id", "start");
    button.innerText = "start game!";
    buttonDiv.append(button);
    const startButton = document.getElementById("start");
    startButton.addEventListener("click", () => {
        buttonDiv.innerText = "";
        socket.emit("start", lobbyId, () => {
            startCountdown();
        });
    });
};

function startCountdown() {
    linkDescDiv.innerText = "";
    linkDiv.innerText = "";

    let initialUserData = {"progress": 0, "wpm": 0, "accuracy": 100};
    socket.emit("send-data", lobbyId, userId, initialUserData, (game) => {
        updateMultiplayerScoreboard(game);
    });
    
    input.setAttribute("placeholder", "countdown has begun");
    input.addEventListener("blur", () => {input.setAttribute("placeholder", "countdown has begun")});
    input.addEventListener("focus", () => {input.setAttribute("placeholder", "countdown has begun")});
    
    let timer = 11;
    let timerId = setInterval(() => {
        timerDiv.innerText = --timer;
        if (timer < 0) {
            clearInterval(timerId);
            timerDiv.innerText = "";
            startGame();
        };
    }, 1000);
};

function generateId() {
    let newId = "";
    let alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

    for(let i = 0; i < 8; i++) {
        newId += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
    };

    return newId;
};

function updateMultiplayerScoreboard(game) {
    scoreboard.innerText = "";

    for (let [curUserId, data] of Object.entries(game.players)) {
        let row = document.createElement("tr");
        let name = document.createElement("td");
        let progress = document.createElement("td");
        if (curUserId === userId)
            name.innerText = curUserId + " [you]";
        else
            name.innerText = curUserId;
        progress.innerText = data.progress + "% completed";
        row.append(name);
        row.append(progress);
        if (data.progress === 100) {
            if (winner === null || winner === curUserId) {
                winner = curUserId;
                row.style.backgroundColor = "#32CD32";
            };
            let wpm = document.createElement("td");
            let accuracy = document.createElement("td");
            wpm.innerText = data.wpm + " wpm";
            accuracy.innerText = data.accuracy + "% accurate";
            row.append(wpm);
            row.append(accuracy);
        };
        scoreboard.append(row);
    };
};

function createMultiplayerQuotable() {
    fetch("/quotable", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        }
    }).then((response) => {
        return response.json();
    }).then((data) => {
        if (data.status === 200) {
            const quote = data.content;
            charLength = data.len;
            socket.emit("create", lobbyId, userId, quote, charLength);
            quoteDiv.innerText = "";
            quote.split("").forEach(char => {
                const charSpan = document.createElement("span");
                charSpan.classList.add("incomplete");
                if (firstLetter) 
                    charSpan.classList.add("current");
                firstLetter = false;
                charSpan.innerText = char;
                quoteDiv.append(charSpan);
            });
            input.value = null;
            input.readOnly = true;
            firstLetter = true;
        } else {
            quoteDiv.innerText = "ERROR: Cannot connect to Quotable API. Please REFRESH the page.";
            quoteDiv.style.color = "red";
        };
    });
};

function joinMultiplayerQuotable(game, error) {
    quoteDiv.innerText = "";

    if (error) {
        quoteDiv.innerText = "ERROR: LOBBY ID DOESN'T EXIST. Please go back to the home page.";
        quoteDiv.style.color = "red";
        input.style.display = "none";
    } else if (game.inProgress) {
        quoteDiv.innerText = "LOBBY'S RACE HAS STARTED. Please go back to the home page.";
        quoteDiv.style.color = "red";
        input.style.display = "none";
    } else {
        socket.emit("send-joined-player", Object.keys(game.players).length, lobbyId, () => {
            updatePlaceholderForLobbyString(Object.keys(game.players).length);
        });
        charLength = game.charLen;
        let quote = game.quote;
        quote.split("").forEach(char => {
            const charSpan = document.createElement("span");
            charSpan.classList.add("incomplete");
            if (firstLetter) 
                charSpan.classList.add("current");
            firstLetter = false;
            charSpan.innerText = char;
            quoteDiv.append(charSpan);
        });
        input.value = null;
        input.readOnly = true;
        firstLetter = true;
    };
};