const socket = io();
const buttonDiv = document.getElementById("button-container");
const timerDiv = document.getElementById("timer");
var room;

socket.on("connect", () => {
    let id = window.location.search.substring(4);


    if (id === "") {
        id = generateId();
        room = id;
        createQuotable(id);
        createStartButton();
    } else {
        socket.emit("join", id);
    }

    socket.on("join-quotable", (quote, charLen, error) => {
        joinQuotable(quote, charLen, error);
    });
    
    socket.on("receive-start", () => {
        startGame();
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
        socket.emit("start", room, () => {
            startGame();
        });
    });
};

function startGame() {
    timer();
}

function timer() {
    let seconds = 10;
    let interval = setInterval(function() {
        timerDiv.innerHTML = seconds-- + "s ";
  
        if (seconds < 0) {
            clearInterval(interval);
            timerDiv.innerHTML = "";
        }
    }, 1000);
}

function generateId() {
    let id = "";
    let alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  
    for(let i = 0; i < 8; i++){
        id += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
    }
    return id;
}

function createQuotable(id) {
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

function joinQuotable(quote, charLen, error) {
    charLength = charLen;
    quoteDiv.innerText = "";

    if (error) {
        quoteDiv.innerText = "ERROR: ROOM DOESN'T EXIST. Please go back to the home page.";
        quoteDiv.style.color = "red";
        input.style.display = "none";
    } else {
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