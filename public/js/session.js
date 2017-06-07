var socket = io();

$(function () {
  $("#idea-submission").submit(function () {
    var inp = $("#idea_field").val();

    if (inp == "") {
      return false;
    }
    socket.emit("idea", $("#idea_field").val());
    $("#idea_field").val("");
    return false;
  });

  socket.on("update", function (msg) {
    var COLOR = "blue";

    $("#ideas").append(
      $("<li class='card'>").append(
        $('<div id="cont-r">').append(
          $('<div id = "colorBar"></div>').attr('style','background-color:'+COLOR+';')
        ).append(
          $('<div id = "textBox">').text(msg)
        )
      )
    );
  });
});
