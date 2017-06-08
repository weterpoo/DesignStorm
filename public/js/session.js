var socket = io();
var COLOR = "#ff5757";


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

  //put the theme on the top of the page
  socket.on("theme", function(theme){
    $("h3").text(theme);
  });

  //connection settup
  socket.on("connect", function () {
    socket.emit("initProblems", socket.id);
  });

  socket.on("update", function (msg) {
    var html =  $("<li class='card'><div id = 'colorBar'></div><div id = 'textBox'><p><span id='" + msg.id + "'>" + msg.idea + "</span></p></div></li>");
    $("#ideas").append(
      html
    );
    $(html)[0].scrollIntoView();
  });
  var max = 3000;
  var isFirstTick = true;
  socket.on("tick", function (msg) {
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

  socket.on("initProblems", function (msg) {
    for (var i = 0; i < msg.length; i++) {
      $("#ideas").append(
        "<li class='card'><div id = 'colorBar'></div><div id = 'textBox'><p><span id='" + msg[i].id + "'>" + msg[i].idea +"</span></p></div></li>"
      );
    }
  });


  var selected = [];
  var num_votes = 0;
  var votes = [];
  socket.on("vote", function () {
    $("#bb").css("display", "none");
    $("#buttonContainer").css("display", "inline-block");
    $(".button").click(function (e) {
      e.preventDefault();
      socket.emit("finishedVoting", selected);
      $("span").off();
      $(".button").off();
      $(".button").addClass("disabled");
    });

    var cards = $("span");
    cards.each(function (index) {
      $(this).click(function () {
        //grabb useful data
        var id = $(this).attr("id");

        var idea = $(this).innerText;
        if (votes.indexOf(id) == -1 && num_votes < 3) {
          // cast vote event
          socket.emit("castVoteProblems", id, 1);
          num_votes++;

          selected.push(idea);
          votes.push(id);
          //add class
          $(this).addClass("span-selected");

        } else if (votes.indexOf(id) != -1) {
          //remove the votes
          votes.splice(votes.indexOf(id), 1);
          num_votes--;

          selected.splice(selected.indexOf(idea), 1);
          //fire event to castVote
          socket.emit("castVoteProblems", id, -1);

          $(this).removeClass("span-selected");

        } else if (num_votes >= 3) {
          alert("You've already voted three times!");
        }
      });
    });
  });
  socket.on("move to solutions", function () {
    window.location.href = "/solutions";
  });
});
