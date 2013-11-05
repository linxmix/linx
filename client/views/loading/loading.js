Template.loadingPage.rendered = function () {

  var square = new Sonic({
      width: 100,
      height: 100,
      fillColor: '#000',
      path: [
          ['line', 10, 10, 90, 10],
          ['line', 90, 10, 90, 90],
          ['line', 90, 90, 10, 90],
          ['line', 10, 90, 10, 10]
      ]
  });

  square.play();

  $('#loadingIcon').append(square.canvas); 
}

Template.loadingPage.uploadCount = function () {
  return Session.get("uploads_in_progress");
}