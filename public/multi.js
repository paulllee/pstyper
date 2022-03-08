const socket = io();
const buttonDiv = document.getElementById("button-container");
const timerDiv = document.getElementById("timer");
const scoreboardDiv = document.getElementById("scoreboard");
var charNum = 0;
var raceId, userId;

socket.on("connect", () => {
    userId = socket.id;
    let queryId = window.location.search.substring(4);

    if (queryId === "") {
        raceId = generateId();
        createMultiplayerQuotable();
        createStartButton();
    } else {
        raceId = queryId;
        socket.emit("join", raceId, userId);
    }

    socket.on("join-quotable", (game, error) => {
        joinMultiplayerQuotable(game, error);
    });
    
    socket.on("receive-start", () => {
        startCountdown();
    });

    socket.on("receive", (game) => {
        console.log(game);
    });
});

replacePlaceholderInputEventListener("waiting for players...", "waiting for players...");

function createStartButton() {
    let button = document.createElement("button");
    button.classList.add("start");
    button.setAttribute("id", "start");
    button.innerText = "start game!";
    buttonDiv.append(button);
    const startButton = document.getElementById("start");
    startButton.addEventListener("click", () => {
        buttonDiv.innerText = "";
        socket.emit("start", raceId, () => {
            startCountdown();
        });
    });
};

function startGame() {
    input.readOnly = false;
    input.focus();
    
    replacePlaceholderInputEventListener("click here to focus", "start typing...");
    
    input.removeEventListener("input", updateSingleplayerGameState);
    input.addEventListener("input", updateMultiplayerGameState);
};

function updateMultiplayerGameState() {
    startTimer();

    const quoteSpanArray = quoteDiv.querySelectorAll("span");
    const inputArray = input.value.split("");

    quoteSpanArray.forEach((charSpan, index) => {
        const char = inputArray[index];

        if (char == null) {
            charSpan.classList.add("incomplete");
            charSpan.classList.remove("correct");
            charSpan.classList.remove("incorrect");
            charSpan.classList.remove("current");
        } else if (char === charSpan.innerText) {
            charSpan.classList.add("correct");
            charSpan.classList.remove("incorrect");
            charSpan.classList.remove("incomplete");
            charSpan.classList.remove("current");
        } else {
            charSpan.classList.add("incorrect");
            charSpan.classList.remove("correct");
            charSpan.classList.remove("incomplete");
            charSpan.classList.remove("current");
        }

        if (inputArray.length === index) {
            charSpan.classList.add("current");
        } else if ((inputArray.length - 1 === index) && (charSpan.classList.contains("incorrect")))
            incorrect++;
    });

    if (++charNum % 10 === 0) {
        let curProgress = Math.floor((inputArray.length / charLength) * 100);
        let curWpm = getWpm();
        let userData = {"progress": curProgress, "wpm": curWpm};
        socket.emit("send", raceId, userId, userData);
    }

    if (isGameDone(quoteSpanArray, inputArray)) {
        stopTimer();
        let userData = {"progress": 100, "wpm": getWpm()};
        socket.emit("send", raceId, userId, userData);
        wpmDiv.innerText = "Your WPM is: " + getWpm();
        accDiv.innerText = "Your Accuracy Percentage is: " + (100 * charLength / (charLength + incorrect)).toFixed(2) + "%";
        incorrect = 0;
        input.readOnly = true;
    };
};

function startCountdown() {
    let initialUserData = {"progress": 0, "wpm": 0};
    socket.emit("send", raceId, userId, initialUserData);
    replacePlaceholderInputEventListener("countdown has begun...", "countdown has begun...");
    
    let timer = 11;
    let timerId = setInterval(function() {
        timerDiv.innerText = --timer;
        if (timer === 5) {
            replacePlaceholderInputEventListener("get ready...", "get ready...");
        } else if (timer < 0) {
            clearInterval(timerId);
            timerDiv.innerText = "";
            startGame();
        }
    }, 1000);
};

function generateId() {
    let newId = "";
    let alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

    for(let i = 0; i < 8; i++) {
        newId += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
    }

    return newId;
};

function createMultiplayerQuotable() {
    fetch("/quotable", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        }
    }).then(function(response) {
        return response.json();
    }).then(function(data) {
        if (data.status === 200) {
            const quote = data.content;
            charLength = data.len;
            socket.emit("create", raceId, userId, quote, charLength);
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
        quoteDiv.innerText = "ERROR: RACE ID DOESN'T EXIST. Please go back to the home page.";
        quoteDiv.style.color = "red";
        input.style.display = "none";
    } else if (game.inProgress) {
        quoteDiv.innerText = "RACE IS IN PROGRESS. Please go back to the home page.";
        quoteDiv.style.color = "red";
        input.style.display = "none";
    } else {
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