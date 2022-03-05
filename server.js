let axios = require("axios");
const express = require("express");
const app = express();

const port = 3000;
const hostname = "localhost";

app.use(express.static("public"));
app.use(express.json());

const QUOTABLE_API_URL = 'https://api.quotable.io/random?minLength=125';

app.get("/quotable", function(req, res) {
    axios.get(QUOTABLE_API_URL).then(function (response) {
        res.status(200);
        res.json({"status": 200,
        "content": response.data.content,
        "author": response.data.author});
    });
})

app.listen(port, hostname, () => {
    console.log(`Listening at: http://${hostname}:${port}`);
});