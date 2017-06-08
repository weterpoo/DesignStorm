var express = require("express");
var app = express();
var port = process.env.PORT || 8000;

app.use(express.static("public"));

app.set("view engine", "ejs");

app.get("/", function (req, res) {
  res.render('index');
});

app.get("/create", function (req, res) {
  res.render('create');
});

app.get("/session", function (req, res) {
  res.render('session');
});

app.get("/solutions", function (req, res) {
  res.render("solutions");
});

app.get("/results", function (req, res) {
  res.render("results");
});


//start server
var server = app.listen(port, function () {
  console.log("server started");
});

//socket code
var io = require('socket.io')(server);



var time = 15;

var count = 0;
var problemIdeas = [];
var solutionIdeas = [];
var isProblems = true;
var problemVotes = {};
var numPeople = 0;
var numFinishedVoting = 0;
var problemWinners = [];
var duration_S = 0;
var solutionVotes = {};
var numReadyToBrainstormSolutions = 0;

var numFinishedVotingOnSolutions = 0;
var timerSet = false;
var theme = "";
var timer = {};


io.on("connection", function (socket) {
  socket.on("initProblems", function (id) {
    io.to(id).emit("initProblems", isProblems ? problemIdeas : solutionIdeas);
    io.emit("theme",theme);
  });
  socket.on("reset", function (){
     console.log("i'm in the reset");
     count = 0;
     problemIdeas = [];
     solutionIdeas = [];
     isProblems = true;
     problemVotes = {};
     numPeople = 1;
     console.log(numPeople);
     numFinishedVoting = 0;
     problemWinners = [];
     duration_S = 0;

     solutionVotes = {};
     numReadyToBrainstormSolutions = 0;

     numFinishedVotingOnSolutions = 0;
     timerSet = false;
     theme = "";
     timer = {};
  });
  socket.on("duration set", function (duration) {
    theme = duration.theme;
    io.emit("theme", theme);
    duration_S = duration.time;
    time = duration_S;
    if(!timerSet) {
      timer = setInterval(function () {
        io.emit("tick", time);
        time -= 1;

        if (time < 0) {
          clearInterval(timer);
          io.emit("vote");
        }
      }, 1000);
      timerSet=true;
    }
  })

  numPeople++;
  console.log(numPeople);
  console.log("client connected");

  socket.on("problemIdea", function (msg) {
    count++;
    problemIdeas.push({id: count, idea: msg});
    io.emit("update", {id: count, idea: msg});
  });

  socket.on("disconnect", function (client) {
    console.log("disconnected");
    numPeople--;
    console.log(numPeople);
  });

  socket.on("castVoteProblems", function (id, amount) {
    if (problemVotes[id] == undefined) {
      problemVotes[id] = 1;
    } else {
      problemVotes[id] += amount;
    }
  });
  var selectedText = [];
  socket.on("finishedVoting", function (local_selected) {
    numFinishedVoting++;
    console.log("made it");
    console.log(numPeople, numFinishedVoting);
    if (numPeople == numFinishedVoting) {
      console.log("made it here");
      var temp = [];
      console.log(problemVotes);
      for (var key in problemVotes) {
        if (problemVotes.hasOwnProperty(key)) {
          temp.push([key, problemVotes[key]]);
        }
      }

      temp.sort(function (a, b) { return b[1] - a[1] });

      var temp = temp.slice(0, 5);

      var temp2 = [];

      for (var i = 0; i < 5; i++) {
        if (temp[i] != undefined)
          temp2.push(temp[i][0]);
      }
      console.log(temp2);
      function findIdea(id) {
        for (var i = 0; i < problemIdeas.length; i++) {
          if (id == problemIdeas[i]["id"])
            return problemIdeas[i]["idea"];
        }
      }

      for (var i = 0; i < temp2.length; i++) {
        problemWinners.push(findIdea(temp2[i]));
      }

      io.emit("move to solutions");
    }
  });

  socket.on("ready to brainstorm solutions", function () {
    numReadyToBrainstormSolutions++;

    console.log(numPeople);
    console.log(numReadyToBrainstormSolutions);
    if (numReadyToBrainstormSolutions == numPeople) {
      console.log(problemWinners);
      io.emit("begin brainstorming solutions", problemWinners);
      time = duration_S;
      console.log("begin the ticking");
      var solutionTimer = setInterval(function () {
        io.emit("tick solutions", time);
        time--;

        if (time < 0) {
          clearInterval(solutionTimer);
          io.emit("vote on solutions");
        }
      }, 1000);
    }
  });

  socket.on("solution idea", function (msg) {
    count++;
    solutionIdeas.push({id: count, idea: msg});
    io.emit("update solutions", {id: count, idea: msg});
  });

  socket.on("vote on solution", function (id, amount) {
    if (solutionVotes[id] == undefined) {
      solutionVotes[id] = 1;
    } else {
      solutionVotes[id] += amount;
    }
  });

  socket.on("finished voting on solutions", function () {
    numFinishedVotingOnSolutions++;

    if (numFinishedVotingOnSolutions == numPeople) {
      io.emit("go to results");
    }
  });

  //********************* FOR RESULTS PAGE    **********************
  var winFeatures;
  socket.on("solutionVotingComplete", function(){
    //load with the winners
    io.emit("load_soln", solnWinner);
    timer = setInterval(function () {
      io.emit("tick_feats", time);
      time -= 1;

      if (time < 0) {
        clearInterval(timer);
        io.emit("vote_feats");
      }
    }, 1000);

  });
  socket.on("castVoteFeats", function (id, amount) {
    if (featureVotes[id] == undefined) {
      featureVotes[id] = 1;
    } else {
      featureVotes[id] += amount;
    }
  });
  socket.on("completeFeatVoting", function(){
    io.emit("genPDF", winFeatures);
  })


});
