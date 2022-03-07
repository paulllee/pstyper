var socket = io();
var multiId = crypto.randomUUID();
socket.emit("create", multiId);