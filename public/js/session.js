var socket = io();
var COLOR = "red";

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
    socket.emit("problemIdea", $("#idea_field").val());
    $("#idea_field").val("");
    return false;
  });

  socket.on("update", function (msg) {
    $("#ideas").append(
      $("<li class='card'>").append(
        $('<div id="cont-r">').append(
          $('<div id = "colorBar"></div>').attr('style','background-color:'+COLOR+';')
        ).append(
          $('<div id = "textBox">').text(msg.idea)
        )
      )
    );
  });

  socket.on("tick", function (msg) {
    if (msg <= 0) {
      $("#timer").text("Time's up");
      $("#idea_field").prop("disabled", true);
      return false;
    }
    //progress bar code
    var isFirstTick = true;
    if (isFirstTick) {
      var bar = document.getElementById("myBar");
      var timeDelta = msg*10; // ms
      var id = setInterval(frame, timeDelta);
      var width = 1;
      function frame() {
          if (width <= 100) {
              width++;
              bar.style.width = width + '%';
          }
      }
      isFirstTick = false;
    }

    var minutes = parseInt(msg / 60);
    var seconds = msg % 60;

    $("#timer").text(formatTime(minutes, seconds));
    return false;
  });

  socket.on("init", function (msg) {
    for (var i = 0; i < msg.length; i++) {
      $("#ideas").append(
        $("<li class='card'>").append(
          $('<div id="cont-r">').append(
            $('<div id = "colorBar"></div>').attr('style','background-color:'+COLOR+';')
          ).append(
            $('<div id = "textBox">').text(msg[i].idea)
          )
        )
      );
    }
  });
});
