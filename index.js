var express = require("express");
var app = express();
// var favicon = require('serve-favicon');

var port = process.env.PORT || 8080;


app.use(express.static("public"));
// app.use(favicon(__dirname + '/favicon.ico'));
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
var server = app.listen(port, function() {
  console.log("server started");
});

//socket code
var io = require('socket.io')(server);

var time = 15;

io.on("connection", function(socket) {
  console.log("client connected");
  socket.on("hello world", function() {
    console.log("hey!");
  });

  socket.on("idea", function (msg) {
    io.emit("update", msg);
  });

  socket.on("disconnect", function(client) {
    console.log("disconnected");
  });
});

setInterval(function () {
    io.emit("tick", time);
    time -= 1;
  }, 1000);
