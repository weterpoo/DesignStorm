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

var time = 15;
var count = 0;
var problemIdeas = [];
var solutionIdeas = [];
var isProblems = true;

io.on("connection", function (socket) {
  io.emit("init", isProblems ? problemIdeas : solutionIdeas);

  console.log("client connected");

  socket.on("problemIdea", function (msg) {
    count += 1;
    problemIdeas.push({id: count, idea: msg});
    io.emit("update", {count: count, idea: msg});
  });

  socket.on("disconnect", function(client) {
    console.log("disconnected");
  });
});

setInterval(function () {
  io.emit("tick", time);
  time -= 1;
}, 1000);
