//
// link button clicks to event handler
//
Template.uploaderPage.events({

  'click button': function (e) {
    var action = e.target.dataset && e.target.dataset.action;
    // pass click to event handlers
    if (action && action in eventHandlers) {
      eventHandlers[action](e, e.target.dataset.id);
    }
  }

});

//
// key events
//
var keyBindingsInterval = Meteor.setInterval(function(){
   if (Meteor.Keybindings) {
     Meteor.clearInterval(keyBindingsInterval);
     addKeyBindings();
   }
}, 500);

function addKeyBindings() {
  Meteor.Keybindings.add({
    'space': eventHandlers['playPause'],
    'left': eventHandlers['markStart'],
    'right': eventHandlers['markEnd'],
    'down/shift+down': eventHandlers['back'],
    'up/shift+up': eventHandlers['forth']
  });
}

//
// event handlers
//
var eventHandlers = {

  'playPause': function(e) {
    var id = (e.target.dataset && e.target.dataset.id) ||
      Uploader.waves['lastWaveClicked'];
    if (!Uploader.waves['modalWaveOpen']) {
      e.preventDefault();
      // we want this to be a universal pause
      if (Uploader.waves['playingWave']) {
        Uploader.pause();
      } else {
        Uploader.playWave(id);
      }
    }
  },

  'markStart': function(e) {
    var id = (e.target.dataset && e.target.dataset.id) ||
      Uploader.waves['lastWaveClicked'];
    e.preventDefault();
    Uploader.waves[id].mark({
      id: 'start',
      color: 'rgba(0, 255, 0, 0.8)'
    });
  },

  'markEnd': function(e) {
    var id = (e.target.dataset && e.target.dataset.id) ||
      Uploader.waves['lastWaveClicked'];
    e.preventDefault();
    Uploader.waves[id].mark({
      id: 'end',
      color: 'rgba(255, 0, 0, 0.8)'
    });
  },

  'back': function(e) {
    var id = (e.target.dataset && e.target.dataset.id) ||
      Uploader.waves['lastWaveClicked'];
    e.preventDefault();
    var dist = -0.005;
    if (e.shiftKey) {
       dist *= 50;
    }
    Uploader.waves[id].skip(dist);
  },

  'forth': function(e) {
    var id = (e.target.dataset && e.target.dataset.id) ||
      Uploader.waves['lastWaveClicked'];
    e.preventDefault();
    var dist = 0.005;
    if (e.shiftKey) {
       dist *= 50;
    }
    Uploader.waves[id].skip(dist);
  },

  'upload': function(e) {

    // userId check
    if (!Meteor.userId()) {
      return alert("Sorry, but you must be logged in to submit a transition!");
    }

    // validation check
    // TODO: add marker checks to this validation!
    // TODO: also check file types, volumes, and song metadata
    //for (var waveId in waves) {
    //  if (!waves[waveId].backend.buffer) {
    //    return alert("All three waves must be loaded and marked before submitting.");
    //  }
    //}

    // upload any new songs and upload transition
    var startWave = Uploader.waves['startWave'];
    var transitionWave = Uploader.waves['transitionWave'];
    var endWave = Uploader.waves['endWave'];
    if (startWave.song.isNew) {
      startWave.song.volume = $('#startWave .volumeSlider').data('slider').getValue();
      uploadSongWave(startWave);
    }
    if (endWave.song.isNew) {
      endWave.song.volume = $('#endWave .volumeSlider').data('slider').getValue();
      uploadSongWave(endWave);
    }
    uploadTransitionWave(transitionWave, startWave, endWave);
  }
};

function uploadTransitionWave(transitionWave, startWave, endWave) {
  var startSongEnd = startWave.markers['end'].position;
  var endSongStart = endWave.markers['start'].position;

  var startTime = transitionWave.markers['start'].position;
  var endTime = transitionWave.markers['end'].position;

  var startSong = Songs.findOne({ 'name': startWave.song.name });
  var endSong = Songs.findOne({ 'name': endWave.song.name });

  // add transition to database
  var transition = {
    'type': 'transition',
    'transitionType': 'active',
    // TODO: make this based on given buffer's file name extension
    'fileType': 'mp3',
    'startSong': startSong._id,
    'startSongEnd': startSongEnd,
    'endSong': endSong._id,
    'endSongStart': endSongStart,
    'startTime': startTime,
    'endTime': endTime,
    'volume': $('#transitionWave .volumeSlider').data('slider').getValue()
  };
  //Transitions.insert(transition);

  // upload transition to s3 server
  var url = Mixer.getSampleUrl(transition);
  uploadWave(transitionWave, url);
}

function uploadSongWave(wave) {
  // add song to database
  //Songs.insert(wave.song);
  // upload song to s3 server
  var url = Mixer.getSampleUrl(wave.song);
  uploadWave(wave, url);
}

// uploads buffer of given wave to given s3 url
function uploadWave(wave, url) {
  console.log("fake call to upload wave with url: "+url);
  console.log(wave);
  //Meteor.call('putStream', wave.bufferData, 'test.mp3');
}
