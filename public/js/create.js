// Create page js
var socket = io();
// begin contact with server

$(function () {
  $("#duration").submit(function (...args) {
    var min = $("#min").val();
    var sec = $("#sec").val();
    alert(min)
    socket.emit("duration set", min*60+sec);
    //win.location.replace("/session");
  });
});
