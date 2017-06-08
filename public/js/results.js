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

// Function for creating tables in the .pdf
function voteTable(data, columns) {
    var body = [];

    body.push(columns);

    data.forEach(function(row) {
        var dataRow = [];

        columns.forEach(function(column) {
            dataRow.push(row[column].toString());
        })

        body.push(dataRow);
    });

    return {
      table: {
        headerRows: 1,
        body
      }
    };
}
var counter = 1;
//add msg to candidates
function makeLi(msg){
  var html =  $("<li class='card'><div id = 'colorBar'></div><div id = 'textBox'><p><span id='"+counter+"'>" + msg + "</span></p></div></li>");
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
    return false;
  });

  //put the theme on the top of the page
  socket.on("theme_feat", function(theme){
    $('h3')[0].innerText = theme;
  });

  socket.on("updateFeats", function(msg){
    console.log("Feat add!!");
    var html =  $("<li class='card'><div id = 'colorBar'></div><div id = 'textBox'><p><span id='" + msg.id + "'>" + msg.idea + "</span></p></div></li>");
    $("#ideas").append(html);
    $(html)[0].scrollIntoView();
  });

  // WHEN everyone complete load in data
  socket.on("load_soln", function(soln){
    var html =  $("<li class='card'><div id = 'textBox'><p><span id='prob'>" + soln + "</span></p></div></li>");
    $("#problems").text(soln);
    $("input#idea_field").prop("disabled", false);
  });

  //ticker
  var max = 3000;
  var isFirstTick = true;
  socket.on("tick_feats", function (msg) {
    console.log("tick");
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
  socket.on("vote_feats", function () {
    $("#bb").css("display", "none");
    $("#buttonContainer").css("display", "inline-block");
    $(".button").click(function (e) {
      e.preventDefault();
      socket.emit("completeFeatVoting");
      $("span").off();
      $(".button").off();
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

  socket.on("genPDF", function (session) {
    debugger;
    console.log("pdf testing time");

    // Example text for testing .pdf download
    // Need to change example to work with real JSON
    // session = {"names":["Peter","Kenan","Teddy","Will","Quinn"],
    //         "problems":[
    //         {problem: "problem1", votes: 1},
    //         {problem: "problem2", votes: 2},
    //         {problem: "problem3", votes: 8}
    //         ],
    //         "solutions":[
    //         {solution: "solution1", votes: 5},
    //         {solution: "solution2", votes: 11},
    //         {solution: "solution3", votes: 0}
    //         ],
    //         "statement":"Convert a JSON to .pdf"
    // };

    // Need to decide on JSON implementation


    // pdfmake code

    // Get Date
    var d = new Date();
    var day = d.getDate();
    var month = d.getMonth()+1;
    var year = d.getFullYear();
    var today = month + '/' + day + '/' + year;

    var pdfDoc = {
      content: [
        {
          image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAdUAAAAvCAYAAAC1x1A8AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyZpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMDY3IDc5LjE1Nzc0NywgMjAxNS8wMy8zMC0yMzo0MDo0MiAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTUgKFdpbmRvd3MpIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOkM2RUQxOUJENEJERDExRTc4NDlFQzExMUUyMUQzMjQ2IiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOkM2RUQxOUJFNEJERDExRTc4NDlFQzExMUUyMUQzMjQ2Ij4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6QzZFRDE5QkI0QkREMTFFNzg0OUVDMTExRTIxRDMyNDYiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6QzZFRDE5QkM0QkREMTFFNzg0OUVDMTExRTIxRDMyNDYiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz4F0+EmAAAhfElEQVR42uxd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'
        },
        {text: 'Session Report\n\n', bold: true, fontSize: 30},
        today,

        {text: '\nParticipants:', bold: true, fontSize: 16},
        session.names,

        {text: '\n\nPhase One: Problems', bold: true, fontSize: 14},
        voteTable(session.problems, ['idea','votes']),

        {text: '\n\nPhase Two: Solutions', bold: true, fontSize: 14},
        voteTable(session.solutions, ['idea','votes']),

        {text: '\n\nPhase Three: Features', bold: true, fontSize: 14},
        voteTable(session.features, ['idea','votes']),

        {text: '\n\nPhase Four: Mission Statement', bold: true, fontSize: 14},
        session.statement
      ]
    }

      pdfMake.createPdf(pdfDoc).download('test.pdf');
  });
});
