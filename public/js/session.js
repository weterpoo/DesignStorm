var socket = io();
var COLOR = "#ff5757";
console.log()

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

  socket.on("connect", function () {
    socket.emit("initProblems", socket.id);
  });

  socket.on("update", function (msg) {
    var html =  $("<li class='card'><div id = 'colorBar'></div><div id = 'textBox'><p><span>" + msg.idea +"</span></p></div></li>");
    $("#ideas").append(
      html
    );
    $(html)[0].scrollIntoView();
  });
  var isFirstTick = true;
  socket.on("tick", function (msg) {
    console.log("tick");
    console.log(msg);
    if (msg <= 0) {
      $("#timer").text("Time's up");
      $("#idea_field").prop("disabled", true);
      return false;
    }
    //progress bar code

    if (isFirstTick) {
      var bar = document.getElementById("myBar");
      var timeDelta = msg; // ms
      var id = setInterval(frame, timeDelta);
      var width = 1;
      function frame() {
          if (width <= 100) {
              width += .1;
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

  socket.on("initProblems", function (msg) {
    console.log("I made it");
    for (var i = 0; i < msg.length; i++) {
      $("#ideas").append(
        // $("<li class='card' id='" + msg[i].id + "'>").append(
        //   $('<div id="cont-r">').append(
        //     $('<div id = "colorBar"></div>').attr('style','background-color:'+COLOR+';')
        //   ).append(
        //     $('<div id = "textBox">').text(msg[i].idea)
        //   )
        // )
        "<li class='card'><div id = 'colorBar'></div><div id = 'textBox'><p><span>" + msg[i].idea +"</span></p></div></li>"
      );
    }
  });

  var num_votes = 0;
  var votes = [];
  socket.on("vote", function () {
    console.log("received");
    var cards = $(".card");
    console.log(cards.length);
    cards.each(function (index) {
      $(this).click(function () {
        var id = $(this).attr("id");

        if (votes.indexOf(id) == -1 && num_votes < 3) {
          socket.emit("castVoteProblems", id, 1);
          num_votes++;
          votes.push(id);
          console.log("voted");
        } else if (votes.indexOf(id) != -1) {
          votes.splice(votes.indexOf(id), 1);
          num_votes--;
          socket.emit("castVoteProblems", id, -1);
        } else if (num_votes >= 3) {
          console.log("You've already voted three times!");
        }
      });
    });
  });
});
