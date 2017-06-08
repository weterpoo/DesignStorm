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
    min = checkNaN(min);
    sec = checkNaN(sec);
    var theme = $('input')[2].value;
    socket.emit("duration set", {'time':min*60+sec, 'theme':theme});
    //win.location.replace("/session");
  });
});

function checkNaN(x) {
  if (isNaN(x)) {
    return 0;
  }
  return x;
}
