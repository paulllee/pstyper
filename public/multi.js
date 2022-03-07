const socket = io();
var multiId;

function checkGameStatus() {
    multiId = window.location.search.substring(4).toString();
    if (multiId === "") {
        multiId = "me";
        socket.emit("create", multiId);
    } else {
        socket.emit("join", multiId);
    }
}