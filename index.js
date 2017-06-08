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

var time = 20;
var count = 0;
var problemIdeas = [];
var solutionIdeas = [];
var isProblems = true;
var problemVotes = {};


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

  console.log("client connected");

  socket.on("problemIdea", function (msg) {
    count += 1;
    problemIdeas.push({id: count, idea: msg});
    io.emit("update", {id: count, idea: msg});
  });

  socket.on("disconnect", function (client) {
    console.log("disconnected");
  });

  socket.on("castVoteProblems", function (id, amount) {
    if (problemVotes.id == undefined) {
      problemVotes.id = 1;
    } else {
      problemVotes.id += amount;
    }
  });
});
