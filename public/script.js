const wpmDiv = document.getElementById("wpm");
const accDiv = document.getElementById("acc");
const quoteDiv = document.getElementById("quote");
const userBest = document.getElementById("user-best");
const input = document.getElementById("input");
const scoreboard = document.getElementById("scoreboard");
var time, timerId, charLength;
var firstLetter = true;
var incorrect = 0;
var timeStarted = false;

input.setAttribute("placeholder", "start typing...");
input.addEventListener("blur", () => {input.setAttribute("placeholder", "click here to focus")});
input.addEventListener("focus", () => {input.setAttribute("placeholder", "start typing...")});
input.addEventListener("input", updateSingleplayerGameState);

function updateSingleplayerGameState() {
    startTimer();

    const quoteSpanArray = quoteDiv.querySelectorAll("span");
    const inputArray = input.value.split("");

    updateCharacters(quoteSpanArray, inputArray);
    updateIfSingleplayerGameDone(quoteSpanArray, inputArray);
};

function updateCharacters(quoteSpanArray, inputArray) {
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
};

function updateIfSingleplayerGameDone(quoteSpanArray, inputArray) {
    if (isGameDone(quoteSpanArray, inputArray)) {
        stopTimer();
        let data = {"wpm": getWpm(), "accuracy": getAccuracy()};
        updateSingleplayerScoreboard(data);
        updatePlayerBestWPM(getWpm());
        incorrect = 0;
        input.readOnly = true;
    };
};

function updatePlayerBestWPM(wpm) {
    fetch("/update/wpm", {
		method: "POST",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify({
			wpm: wpm
		})
	}).then(function (response) {
		if (response.status === 200) {
			console.log("Recieved Data");
		} else {
			console.log("Data not recieved");
		}
	});
}

function displayUserBest() {
    console.log("called");
    fetch("/display", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        }
    }).then((response) => {
        return response.json();
    }).then((data) => {
        if (data.status == 200) {
            console.log("Yes");
            userBest.innerText = "Hi " + data.name + ", your highest wpm so far is: " + data.bestWPM;
        } else {
            console.log("Not logged in");
        };
    });
}

function updateSingleplayerScoreboard(data) {
    scoreboard.innerText = "";

    let row = document.createElement("tr");
    let wpm = document.createElement("td");
    let accuracy = document.createElement("td");
    wpm.innerText = data.wpm + " wpm";
    accuracy.innerText = data.accuracy + "% accurate";
    row.append(wpm);
    row.append(accuracy);

    scoreboard.append(row);
}

function isGameDone(qArr, iArr) {
    let gameOver = true;
    qArr.forEach((charSpan, index) => {
        const char = iArr[index];
        if (!(charSpan.innerText === char)) 
            gameOver = false;
    });
    return gameOver;
};

function startTimer() {
    if (!timeStarted) {
        time = 0;
        timerId = setInterval(() => {time++;}, 1000);
        timeStarted = true;
    }
};

function stopTimer() {
    clearInterval(timerId);
    timeStarted = false;
};

function getWpm() {
    let cpm = charLength / (time / 60);
    return Math.floor(cpm / 5);
};

function getAccuracy() {
    return (100 * charLength / (charLength + incorrect)).toFixed(2);
}

function singleplayerQuotable() {
    displayUserBest();
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