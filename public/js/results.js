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
      $(".button").addClass("disabled");
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
        //{image: 'img/logo.png'},
        {text: 'DesignStorm Session Report\n\n', bold: true, fontSize: 30},
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
