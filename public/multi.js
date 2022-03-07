const socket = io();

socket.on("connect", () => {
    let id = window.location.search.substring(4).toString();

    if (id === "") {
        createQuotable(socket.id);
    } else {
        socket.emit("join", id);
    }
});

socket.on("join-quotable", (quote, charLen, error) => {
    joinQuotable(quote, charLen, error);
    console.log("HI");
});

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
        firstLetter = true;
    };
};