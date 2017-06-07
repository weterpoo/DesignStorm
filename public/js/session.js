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
    $("#ideas").append($("<li>").text(msg));
  });
});
