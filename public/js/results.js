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

//add msg to candidates
function makeLi(msg){
  var html =  $("<li class='card'><div id = 'colorBar'></div><div id = 'textBox'><p><span id='" + msg.id + "'>" + msg.idea + "</span></p></div></li>");
  $("#ideas").append(
    html
  );
  $(html)[0].scrollIntoView();
}

$(function () {
  socket.emit("ready to brainstorm features");
  $("#idea-submission").submit(function () {
    var inp = $("#idea_field").val();

    if (inp == "") {
      return false;
    }

    socket.emit("featureIdea", $("#idea_field").val());
    $("#idea_field").val("");
  });

  //put the theme on the top of the page
  socket.on("theme_feat", function(theme){
    $('h3')[0].innerText = theme;
  });

  // WHEN everyone complete load in data
  socket.on("load_soln", function(soln){
    makeLi(soln);
    $("input#bb").prop("disabled", false);
  });

  //ticker
  var max = 3000;
  var isFirstTick = true;
  socket.on("tick_feat", function (msg) {
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
    console.log("I made it");
    for (var i = 0; i < msg.length; i++) {
      $("#ideas").append(
        "<li class='card'><div id = 'colorBar'></div><div id = 'textBox'><p><span id='" + msg[i].id + "'>" + msg[i].idea +"</span></p></div></li>"
      );
    }
  });


  var selected = [];
  var num_votes = 0;
  var votes = [];
  socket.on("vote_feat", function () {
    $(".button").click(function (e) {
      e.preventDefault();
      socket.emit("finishedVoting");
      $("span").off();
    });

    console.log("received");
    var cards = $("span");
    cards.each(function (index) {
      $(this).click(function () {
        //grabb useful data
        var id = $(this).attr("id");
        var idea = $(this).innerText;
        if (votes.indexOf(id) == -1 && num_votes < 3) {
          // cast vote event
          socket.emit("castVoteFeats", id, 1);
          num_votes++;
          votes.push(id);
          //add class
          $(this).addClass("span-selected");
          console.log("voted");

        } else if (votes.indexOf(id) != -1) {
          //remove the votes
          votes.splice(votes.indexOf(id), 1);
          num_votes--;
          //fire event to castVote
          socket.emit("castVoteFeats", id, -1);

          $(this).removeClass("span-selected");

          console.log("removed");
        } else if (num_votes >= 3) {
          alert("You've already voted three times!");
        }
        console.log(votes);
      });
    });
  });

  socket.on("genPDF", function () {
    // INSERT PDF GEN CODE HERE - QUINN

  });
});
