var express = require("express");
var app = express();
var port = 8080;

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

//start server
var server = app.listen(port, function () {
  console.log("server started");
});

//socket code
var io = require('socket.io')(server);

var time = 1 * 15;
var count = 0;
var problemIdeas = [];
var solutionIdeas = [];
var isProblems = true;
var problemVotes = {};
var numPeople = 0;
var numFinishedVoting = 0;
var problemWinners = [];

var solutionVotes = {};
var numReadyToBrainstormSolutions = 0;

var numFinishedVotingOnSolutions = 0;

io.on("connection", function (socket) {
  socket.on("initProblems", function (id) {
    io.to(id).emit("initProblems", isProblems ? problemIdeas : solutionIdeas);
  });

  numPeople++;
  console.log("client connected");

  socket.on("problemIdea", function (msg) {
    count++;
    problemIdeas.push({id: count, idea: msg});
    io.emit("update", {id: count, idea: msg});
  });

  socket.on("disconnect", function (client) {
    console.log("disconnected");
    numPeople--;
  });

  socket.on("castVoteProblems", function (id, amount) {
    if (problemVotes[id] == undefined) {
      problemVotes[id] = 1;
    } else {
      problemVotes[id] += amount;
    }
  });

  socket.on("finishedVoting", function () {
    numFinishedVoting++;

    if (numPeople == numFinishedVoting) {
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
          temp2.push(temp[i][1]);
      }

      function findIdea(id) {
        for (var i = 0; i < problemIdeas.length; i++) {
          if (id == problemIdeas[i][id])
            return problemIdeas[i][idea];
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
      io.emit("begin brainstorming solutions", problemWinners);
      time = 5 * 60;
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
});

var timer = setInterval(function () {
  io.emit("tick", time);
  time -= 1;

  if (time < 0) {
    clearInterval(timer);
    io.emit("vote");
  }
}, 1000);
