let axios = require("axios");
const express = require("express");
const app = express();

const port = 3000;
const hostname = "localhost";

app.use(express.static("public"));
app.use(express.json());

const QUOTABLE_API_URL = 'http://api.quotable.io/random';

app.get("/quotable", function(req, res) {
    axios.get(QUOTABLE_API_URL).then(function (response) {
        res.status(200);
        res.json({"content": response.data.content,
        "author": response.data.author,
        "length": response.data.length});
    });
})

app.listen(port, hostname, () => {
    console.log(`Listening at: http://${hostname}:${port}`);
});