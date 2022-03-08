const wpmDiv = document.getElementById("wpm");
const accDiv = document.getElementById("acc");
const quoteDiv = document.getElementById("quote");
const input = document.getElementById("input");
var time, timerId, charLength;
var firstLetter = true;
var incorrect = 0;
var timeStarted = false;

function setInputPlaceholder(message) {
    input.setAttribute("placeholder", message);
}

input.addEventListener("blur", setInputPlaceholder("click here to focus"));
input.addEventListener("focus", setInputPlaceholder("start typing..."));

function replacePlaceholderInputEventListener(blurText, FocusText) {
    input.setAttribute("placeholder", FocusText);

    input.removeEventListener("blur", setInputPlaceholder);
    input.removeEventListener("focus", setInputPlaceholder);

    input.addEventListener("blur", setInputPlaceholder(blurText));
    input.addEventListener("focus", setInputPlaceholder(FocusText));
};

input.addEventListener("input", updateSingleplayerGameState);

function updateSingleplayerGameState() {
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

    if (isGameDone(quoteSpanArray, inputArray)) {
        stopTimer();
        wpmDiv.innerText = "Your WPM is: " + getWpm();
        accDiv.innerText = "Your Accuracy Percentage is: " + (100 * charLength / (charLength + incorrect)).toFixed(2) + "%";
        incorrect = 0;
        input.readOnly = true;
    };
};

function isGameDone(qArr, iArr) {
    let gameOver = true;
    qArr.forEach((charSpan, index) => {
        const char = iArr[index];
        if (!(charSpan.innerText === char)) 
            gameOver = false;
    });
    return gameOver;
}

function startTimer() {
    if (!timeStarted) {
        time = 0;
        timerId = setInterval(function() {time++;}, 1000);
        timeStarted = true;
    }
}

function stopTimer() {
    clearInterval(timerId);
    timeStarted = false;
}

function getWpm() {
    let cpm = charLength / (time / 60);
    return Math.floor(cpm / 5);
}

function singleplayerQuotable() {
    fetch("/quotable", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        }
    }).then(function (response) {
        return response.json();
    }).then(function (data) {
        if (data.status === 200) {
            const quote = data.content;
            charLength = data.len;
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
            firstLetter = true;
        } else {
            quoteDiv.innerText = "ERROR: Cannot connect to Quotable API. Please REFRESH the page.";
            quoteDiv.style.color = "red";
        };
    });
};