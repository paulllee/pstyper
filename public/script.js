const quoteDiv = document.getElementById("quote");
const input = document.getElementById("input");

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
            quoteDiv.innerText = "";
            quote.split("").forEach(char => {
                const charSpan = document.createElement("span");
                charSpan.innerText = char;
                quoteDiv.append(charSpan);
            });
            input.value = null;
        };
    });
};