var socket = io();

function formatTime(minutes, seconds) {
  str = minutes.toString() + ":";
  if (seconds.toString().length == 1) {
    str += "0" + seconds;
  } else {
    str += seconds;
  }

  return str;
}

$(function () {
  $("#idea-submission").submit(function () {
    var inp = $("#idea_field").val();

    if (inp == "") {
      return false;
    }
    socket.emit("idea", $("#idea_field").val());
    $("#idea_field").val("");
    return false;
  });

  socket.on("update", function (msg) {
    $("#ideas").append($("<li>").text(msg));
  });

  socket.on("tick", function (msg) {
    if (msg <= 0) {
      $("#timer").text("Time's up");
      $("#idea_field").prop("disabled", true);
      return false;
    }

    var minutes = parseInt(msg / 60);
    var seconds = msg % 60;

    $("#timer").text(formatTime(minutes, seconds));
    return false;
  });

});
