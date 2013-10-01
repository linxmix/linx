Session.set("waves", []);

Meteor.startup(function () {
  var startWave = makeWave("startWave",'songs/the sky.mp3', "Drop starting song here."),
      transitionWave = makeWave("transitionWave",'transitions/the sky-lightspeed.mp3', "Drop transition here."),
      endWave = makeWave("endWave",'songs/lightspeed.mp3', "Drop ending song here.");

  function makeWave(id, url, loadText) {
    var wave = Object.create(WaveSurfer);

    // update session object to render new template
    var waves = Session.get("waves");
    waves.push({ id: id, loadText: loadText });
    Session.set("waves", waves);
    return wave;
  }
});

Template.wave.rendered = function () {
  var wave, id = this.data.id;
  switch (id) {

    // when a mark is reached, pause this and play transitionWave
    case 'startWave':
    wave = startWave;
    wave.on('mark', function(mark) {
      wave.pause();
      var transitionStart = transitionWave.markers['start'].position;
      transitionWave.seek(transitionStart);
      transitionWave.play();
    }); break;

    // when a mark is reached, pause this and play endWave
    case 'transitionWave':
    wave = transitionWave;
    wave.on('mark', function(mark) {
      wave.pause();
      var endStart = endWave.markers['start'].position;
      endWave.seek(endStart);
      endWave.play();
      }); break;

    case 'endWave':
    wave = endWave;
    break;
  }
  wave.init({
    container: document.querySelector("#"+id),
    waveColor: 'violet',
    progressColor: 'purple',
    renderer: 'SVG',
    audioContext: context
  });
  wave.bindDragNDrop(document.querySelector('#'+id));
  console.log(id);
};

Template.uploaderPage.rendered = function () {
  // initialize tooltips
  $('.helptip').tooltip();

};
  //wave.init({

  //});
//
  //wave.load(url);

/* Progress bars
var progressBar1 = document.querySelector('#progress-bar1');
progressBar1.style.width = '100%';
wave1.on('ready', function () {
    ProgressBar1.style.display = 'none';
});
*/

Template.uploader.waves = function () {
  return Session.get("waves");
};

Template.wavePlayer.events({

  'click .playPause': function() {
    wave1.playPause();
  },

  'click .markBeginning': function() {
    wave1.mark({
      id: 'up',
      color: 'rgba(0, 255, 0, 0.5)'
    });
  },

  'click .markEnd': function() {
    wave1.mark({
      id: 'down',
      color: 'rgba(255, 0, 0, 0.5)'
    });
  }

});