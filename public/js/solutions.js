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
  socket.emit("ready to brainstorm solutions");

  socket.on("begin brainstorming solutions", function (winners) {
    for (var i = 0; i < winners.length; i++) {
      $("#problems").append("<li>" + winners[i] + "</li>");
    }

    $("input").prop("disabled", false);
  });

  $("#idea-submission").submit(function () {
    var inp = $("#idea_field").val();

    if (inp == "") {
      return false;
    }

    socket.emit("solution idea", $("#idea_field").val());
    $("#idea_field").val("");
    return false;
  });

  socket.on("update solutions", function (msg) {
    var html =  $("<li class='card'><div id = 'colorBar'></div><div id = 'textBox'><p><span id='" + msg.id + "'>" + msg.idea + "</span></p></div></li>");
    $("#ideas").append(html);
    $(html)[0].scrollIntoView();
  });

  var max = 3000;
  var isFirstTick = true;
  socket.on("tick solutions", function (msg) {

    if(isFirstTick){
      max = msg;
      isFirstTick = false;
    }
    if (msg <= 0) {
      document.getElementById("myBar").style.width ="100%";
      $("#timer").text("Time's up");
      $("#idea_field").prop("disabled", true);
      return false;
    }
    //progress bar code
    var bar = document.getElementById("myBar");
    var width = parseInt((1.0-(msg/max))*100)

    if (width <= 100) {
        bar.style.width = width + '%';
    }

    var minutes = parseInt(msg / 60);
    var seconds = msg % 60;

    $("#timer").text(formatTime(minutes, seconds));
    return false;
  });

  var num_votes = 0;
  var votes = [];
  socket.on("vote on solutions", function () {
    $("#bb").css("display", "none");
    $("#buttonContainer").css("display", "inline-block");
    $(".button").click(function (e) {
      e.preventDefault();
      socket.emit("finishedSolutions");
      $("span").off();
      $(".button").off();
      $(".button").addClass("disabled");
    });

    var cards = $("span");
    cards.each(function (index) {
      $(this).click(function () {
        var id = $(this).attr("id");

        if (votes.indexOf(id) == -1 && num_votes < 3) {
          socket.emit("cast vote on solution", id, 1);
          num_votes++;
          votes.push(id);
          $(this).addClass("span-selected");

        } else if (votes.indexOf(id) != -1) {
          votes.splice(votes.indexOf(id), 1);
          num_votes--;
          socket.emit("cast vote on solution", id, -1);
          $(this).removeClass("span-selected");

        } else if (num_votes >= 3) {
          alert("You've already voted three times!");
        }
      });
    });
  });

  socket.on("go to results", function () {
    window.location.replace("/results");
  });
});
