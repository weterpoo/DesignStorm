// Create page js
var socket = io();
// begin contact with server

$(function () {
  $("#duration").submit(function (...args) {
    var $inputs = $('#duration:input');

    // not sure if you wanted this, but I thought I'd add it.
    // get an associative array of just the values.
    var min = parseInt($('input')[0].value);
    var sec = parseInt($('input')[1].value);
    var theme = $('input')[2].value;
    debugger;
    socket.emit("duration set", {'time':min*60+sec, 'theme':theme});
    //win.location.replace("/session");
  });
});
