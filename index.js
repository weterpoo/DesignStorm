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
var featureIdeas = [];

var isProblems = true;
var problemVotes = {};
var numPeople = 0;
var numFinishedVoting = 0;

var problemWinners = [];
var featureWinners = [];
var solutionWinners = [];

var duration_S = 0;
var solutionVotes = {};
var featureVotes = {};
var numReadyToBrainstormSolutions = 0;
var numReadyToBrainstormFeatures = 0;
var numFinishedVotingOnFeatures = 0;

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
     numReadyToBrainstormFeatures = 0;
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

      for (var i = 0; i < 3; i++) {
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

  // ---------------- VOTING on SOLUTIONS ----------------


  socket.on("cast vote on solution", function (id, amount) {
    if (solutionVotes[id] == undefined) {
      solutionVotes[id] = 1;
    } else {
      solutionVotes[id] += amount;
    }
  });

  socket.on("finishedSolutions", function () {
    numFinishedVotingOnSolutions++;
    console.log("----------------------");
    console.log(numPeople);
    console.log(numFinishedVotingOnSolutions);
    if (numFinishedVotingOnSolutions == numPeople) {
      var temp = [];
      console.log(solutionVotes);
      for (var key in solutionVotes) {
        if (solutionVotes.hasOwnProperty(key)) {
          temp.push([key, solutionVotes[key]]);
        }
      }

      temp.sort(function (a, b) { return b[1] - a[1] });
      console.log("TEMP");
      console.log(temp)
      var temp = temp[0];
      console.log("TEMP");
      console.log(temp)
      var temp2 = [];

      temp2.push(temp[0][0]);
      console.log(temp2);
      function findIdea(id) {
        for (var i = 0; i < solutionIdeas.length; i++) {
          if (id == solutionIdeas[i]["id"])
            return solutionIdeas[i]["idea"];
        }
      }

      for (var i = 0; i < temp2.length; i++) {
        solutionWinners.push(findIdea(temp2[i]));
      }

      io.emit("go to results");
    }
  });



  //********************* FOR RESULTS PAGE    **********************
  var winFeatures;
  // NOt used
  // socket.on("solutionVotingComplete", function(){
  //   //load with the winners
  //   console.log("solution winner(s)");
  //   console.log(solutionWinners);
  //   var solution = find_best(solutionWinners[0])
  //   io.emit("load_soln", solution);
  //   timer = setInterval(function () {
  //     io.emit("tick_feats", time);
  //     time -= 1;
  //
  //     if (time < 0) {
  //       clearInterval(timer);
  //       io.emit("vote_feats");
  //     }
  //   }, 1000);
  //
  // });

  socket.on("ready to brainstorm features", function () {
    numReadyToBrainstormFeatures++;

    // io.emit("genPDF")  //works!!
    console.log(numPeople);
    console.log(numReadyToBrainstormFeatures);
    if (numReadyToBrainstormFeatures == numPeople) {
      io.emit("beginBStormFeatures", solution);
      console.log("solution winner(s)");
      console.log(solutionWinners);
      var time = duration_S;
      var solution = solutionWinners[0];
      io.emit("load_soln", solution);
      console.log("Begin ticking!");
      timer = setInterval(function () {
        io.emit("tick_feats", time);
        time -= 1;

        if (time < 0) {
          clearInterval(timer);
          io.emit("vote_feats");
        }
      }, 1000);
    }
  });

  // for adding an new feature
  socket.on("featureIdea", function (msg) {
    console.log("feats idea");
    console.log(msg);
    count++;
    featureIdeas.push({id: count, idea: msg});
    io.emit("updateFeats", {id: count, idea: msg});
  });


  socket.on("castVoteFeats", function (id, amount) {
    console.log("feats vote");
    if (featureVotes[id] == undefined) {
      featureVotes[id] = 1;
    } else {
      featureVotes[id] += amount;
    }
  });

  socket.on("completeFeatVoting", function(){
    numFinishedVotingOnFeatures++;
    console.log("-----------FEAT VOTING-----------");
    console.log(numPeople);
    console.log(numFinishedVotingOnFeatures);
    if (numFinishedVotingOnFeatures == numPeople) {
      var temp = [];

      for (var key in featureVotes) {
        if (featureVotes.hasOwnProperty(key)) {
          temp.push([key, featureVotes[key]]);
        }
      }

      temp.sort(function (a, b) { return b[1] - a[1] });

      var temp = temp;

      var temp2 = [];

      for (var i = 0; i < 3; i++) {
        if (temp[i] != undefined)
          temp2.push(temp[i][0]);
      }
      console.log(temp2);
      function findIdea(id) {
        for (var i = 0; i < featureIdeas.length; i++) {
          if (id == featureIdeas[i]["id"])
            return featureIdeas[i]["idea"];
        }
      }

      for (var i = 0; i < temp2.length; i++) {
        featureWinners.push(findIdea(temp2[i]));
      }
      // --------- BUILD PDF JSON OBJECT ---------------
      function augmentIdeas(ideas, votes) {
        for (var i = 0; i < ideas.length; i++) {
          var id = ideas[i]["id"];
          if (votes[id] != undefined) {
            ideas[i]["votes"] = votes[id];
          } else {
            ideas[i]["votes"] = 0;
          }
        }

        return ideas;
      }

      var augmentedProblemIdeas = augmentIdeas(problemIdeas, problemVotes);
      var augmentedSolutionIdeas = augmentIdeas(solutionIdeas, solutionVotes);
      var augmentedFeatureIdeas = augmentIdeas(featureIdeas, featureVotes);

      function sortIdeas(ideas) {
        var temp = [];
        for (var i = 0; i < ideas.length; i++) {
          temp.push([ideas[i]["idea"], ideas[i]["votes"]]);
        }

        temp.sort(function (a, b) { return b[1] - a[1] } );

        var temp2 = []

        for (var i = 0; i < temp.length; i++) {
          temp2.push({idea: temp[i][0], votes: temp[i][1]});
        }

        return temp2;
      }
      console.log(augmentedProblemIdeas);
      console.log(augmentedSolutionIdeas);
      console.log(augmentedFeatureIdeas);

      var sortedProblemIdeas = sortIdeas(augmentedProblemIdeas);
      var sortedSolutionIdeas = sortIdeas(augmentedSolutionIdeas);
      var sortedFeatureIdeas = sortIdeas(augmentedFeatureIdeas);

      console.log(sortedProblemIdeas );
      console.log(sortedSolutionIdeas);
      console.log(sortedFeatureIdeas );

      console.log("about to generate the pdf");
      var pdf_dat = {
        "names": ["Peter","Kenan","Teddy","Will","Quinn"],
        "problems": sortedProblemIdeas,
        "solutions": sortedSolutionIdeas,
        "features": sortedFeatureIdeas,
      };

      console.log(pdf_dat);
      io.emit("genPDF", pdf_dat);
    }
  })
});
