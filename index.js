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

//start server
var server = app.listen(port, function() {
  console.log("server started");
});

//socket code
var io = require('socket.io')(server);

io.on("connection", function(socket) {
  console.log("client connected");
  socket.on("hello world", function() {
    console.log("hey!");
  });

  socket.on("disconnect", function(client) {
    console.log("disconnected");
  });
});
