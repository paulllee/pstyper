const quoteDiv = document.getElementById("quote");
const input = document.getElementById("input");
var startTime, finishTime, wordCount;
var i = 0;

input.addEventListener("blur", () => {
    input.setAttribute("placeholder", "click here to focus");
});

input.addEventListener("focus", () => {
    input.setAttribute("placeholder", "start typing...");
});

input.addEventListener("input", () => {
    if (i === 0) {
        startTimer();
        i++;
        console.log("start time: " + startTime);
    }

    const quoteSpanArray = quoteDiv.querySelectorAll("span");
    const inputArray = input.value.split("");
    
    quoteSpanArray.forEach((charSpan, index) => {
        const char = inputArray[index];
        if (char == null) {
            charSpan.classList.add("incomplete");
            charSpan.classList.remove("correct");
            charSpan.classList.remove("incorrect");
        } else if (char === charSpan.innerText) {
            charSpan.classList.add("correct");
            charSpan.classList.remove("incorrect");
            charSpan.classList.remove("incomplete");
        } else {
            charSpan.classList.add("incorrect");
            charSpan.classList.remove("correct");
            charSpan.classList.remove("incomplete");
        }
    });

    if (isGameDone(quoteSpanArray, inputArray)) {
        i = 0;
        stopTimer();
        console.log(wordCount);
    }
});

function startTimer() {
    startTime = new Date();
}

function stopTimer() {
    finishTime = new Date();
}

function getTime() {
    return (finishTime - startTime)/1000;
}

function isGameDone(qArr, iArr) {
    let gameOver = true;
    qArr.forEach((charSpan, index) => {
        const char = iArr[index];
        if (!(charSpan.innerText === char)) {
            gameOver = false;
        }
    });
    return gameOver;
}

function setWordCount(quote) {
    wordCount = quote.split(" ").length;   
}

function replaceQuote() {
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
            setWordCount(quote);
            quoteDiv.innerText = "";
            quote.split("").forEach(char => {
                const charSpan = document.createElement("span");
                charSpan.classList.add("incomplete");
                charSpan.innerText = char;
                quoteDiv.append(charSpan);
            });
            input.value = null;
        };
    });
};