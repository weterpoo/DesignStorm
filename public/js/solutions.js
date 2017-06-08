var socket = io();

$(function () {
  console.log("hello");
  socket.emit("ready to brainstorm solutions");

  socket.on("begin brainstorming solutions", function (winners) {
    console.log("begin brainstorm");
    for (var i = 0; i < msg.length; i++) {
      $("#problems").append("<li>" + msg[i] + "</li>");
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
  });

  socket.on("update solutions", function (msg) {
    var html =  $("<li class='card'><div id = 'colorBar'></div><div id = 'textBox'><p><span id='" + msg.id + "'>" + msg.idea + "</span></p></div></li>");
    $("#ideas").append(html);
    $(html)[0].scrollIntoView();
  });

  var isFirstTick = true;
  socket.on("tick solutions", function (msg) {
    console.log("ticking");
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

  var votes = [];
  socket.on("vote on solutions", function () {
    $(".button").click(function (e) {
      e.preventDefault();
      socket.emit("finished voting on solutions");
      $("span").off();
    });

    console.log("received");
    var cards = $("span");
    cards.each(function (index) {
      $(this).click(function () {
        var id = $(this).attr("id");

        if (votes.indexOf(id) == -1 && num_votes < 3) {
          socket.emit("cast vote on solution", id, 1);
          num_votes++;
          votes.push(id);
          $(this).addClass("span-selected");
          console.log("voted");
        } else if (votes.indexOf(id) != -1) {
          votes.splice(votes.indexOf(id), 1);
          num_votes--;
          socket.emit("cast vote on solution", id, -1);
          $(this).removeClass("span-selected");
          console.log("removed");
        } else if (num_votes >= 3) {
          alert("You've already voted three times!");
        }
        console.log(votes);
      });
    });
  });

  socket.on("move to results", function () {
    window.location.replace("/results");
  });
});
