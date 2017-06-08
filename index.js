var express = require("express");
var app = express();
var port = 8080;

app.use(express.static("public"));

app.set("view engine", "ejs");

app.get("/", function(req, res) {
  res.render('index');
});

app.get("/create", function(req, res) {
  res.render('create');
});

app.get("/session", function(req, res) {
  res.render('session');
});

//start server
var server = app.listen(port, function () {
  console.log("server started");
});

//socket code
var io = require('socket.io')(server);

<<<<<<< HEAD
var time = 20;
=======
var time = 15;
>>>>>>> origin/master
var count = 0;
var problemIdeas = [];
var solutionIdeas = [];
var isProblems = true;
var problemVotes = {};
var numPeople = 0;
var numFinishedVoting = 0;


var timer = {};



io.on("connection", function (socket) {
  socket.on("initProblems", function (id) {
    io.to(id).emit("initProblems", isProblems ? problemIdeas : solutionIdeas);
  });

  socket.on("duration set", function (duration) {
    time = duration;
    timer = setInterval(function () {
      io.emit("tick", time);
      time -= 1;

      if (time < 0) {
        clearInterval(timer);
        io.emit("vote");
      }
    }, 1000);

  })

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

      var temp2 = {};

      for (var i = 0; i < 5; i++) {
        if (temp[i] != undefined)
          temp2[i] = temp[i][0];
      }

      console.log(temp2);
      io.emit("moveOn", temp2);
    }
  })
});
