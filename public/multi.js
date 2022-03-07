const socket = io();
const buttonDiv = document.getElementById("button-container");
const timerDiv = document.getElementById("timer");
var id;

socket.on("connect", () => {
    let queryId = window.location.search.substring(4);

    if (queryId === "") {
        id = generateId();
        createQuotable(id);
        createStartButton();
    } else {
        socket.emit("join", queryId);
    }

    socket.on("join-quotable", (game, error) => {
        joinQuotable(game, error);
    });
    
    socket.on("receive-start", () => {
        startCountdown();
    });
});

input.addEventListener("blur", () => {
    input.setAttribute("placeholder", "waiting for players...");
});

input.addEventListener("focus", () => {
    input.setAttribute("placeholder", "waiting for players...");
});

input.addEventListener("input", () => {
    const inputArray = input.value.split("");
    if (inputArray.length % 5 === 0) {
        // broadcast other users the progress
    }
});

function createStartButton() {
    let button = document.createElement("button");
    button.classList.add("start");
    button.setAttribute("id", "start");
    button.innerText = "start game!";
    buttonDiv.append(button);
    const startButton = document.getElementById("start");
    startButton.addEventListener("click", () => {
        buttonDiv.innerText = "";
        socket.emit("start", id, () => {
            startCountdown();
        });
    });
};

function startGame() {
    input.readOnly = false;
    input.focus();
    
    input.setAttribute("placeholder", "start typing...");

    input.addEventListener("blur", () => {
        input.setAttribute("placeholder", "click here to focus");
    });
    
    input.addEventListener("focus", () => {
        input.setAttribute("placeholder", "start typing...");
    });

    startTimer();
}

function startCountdown() {
    let timer = 10;
    let timerId = setInterval(function() {
        timerDiv.innerText = timer--;
  
        if (timer < 0) {
            clearInterval(timerId);
            timerDiv.innerText = "";
            startGame();
        }
    }, 1000);
}

function generateId() {
    let newId = "";
    let alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  
    for(let i = 0; i < 8; i++){
        newId += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
    }
    return newId;
}

function createQuotable() {
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
            socket.emit("create", id, quote, charLength);
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

function joinQuotable(game, error) {
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