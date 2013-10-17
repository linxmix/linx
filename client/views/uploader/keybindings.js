//
// link button clicks to event handler
//
Template.uploaderPage.events({

  'click button': function (e) {
    var action = e.target.dataset && e.target.dataset.action;
    // pass click to event handlers
    if (action && action in eventHandlers) {
      handleEvent(e, action);
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
    'space': function (e) { handleEvent(e, 'playPause'); },
    'left': function(e) { handleEvent(e, 'markStart'); },
    'right': function(e) { handleEvent(e, 'markEnd'); },
    'down/shift+down': function(e) { handleEvent(e, 'back'); },
    'up/shift+up': function(e) { handleEvent(e, 'forth'); },
  });
}

//
// event handlers
//

function handleEvent(e, action) {
  // make sure we are on uploader page and no modals are open
  if ((Meteor.router.nav() === 'uploaderPage') &&
    !(Uploader.waves['modalWaveOpen'])) {
    // figure out the id of this wave
    var id = (e.target && e.target.dataset && e.target.dataset.id) ||
      Uploader.waves['focus'];
    // call appropriate event handler
    eventHandlers[action](e, id);
  }
}

var eventHandlers = {

  'playPause': function(e, id) {
    e.preventDefault();
    var playingId =
      (Uploader.waves['playingWave'] && Uploader.waves['playingWave'].id);
    if (playingId === id) {
      // we want this to be a universal pause
      Uploader.pause();
    } else {
      Uploader.playWave(id);
    }
  },

  'markStart': function(e, id) {
    e.preventDefault();
    Uploader.markWaveStart(Uploader.waves[id]);
  },

  'markEnd': function(e, id) {
    e.preventDefault();
    Uploader.markWaveEnd(Uploader.waves[id]);
  },

  'back': function(e, id) {
    e.preventDefault();
    var dist = -0.005;
    if (e.shiftKey) {
       dist *= 50;
    }
    Uploader.waves[id].skip(dist);
  },

  'forth': function(e, id) {
    e.preventDefault();
    var dist = 0.005;
    if (e.shiftKey) {
       dist *= 50;
    }
    Uploader.waves[id].skip(dist);
  },

  // TODO: move this into uploader itself, it doesn't belong here!
  'upload': function(e) {
    var startWave = Uploader.waves['startWave'];
    var transitionWave = Uploader.waves['transitionWave'];
    var endWave = Uploader.waves['endWave'];

    //
    // validation check
    // 
    if (!Meteor.userId()) {
      return alert("Sorry, but you must be logged in to submit a transition!");
    }
    var valid = true;
    // check buffers are loaded
    if (!(startWave.backend.buffer &&
      transitionWave.backend.buffer &&
      endWave.backend.buffer)) {
      valid = false;
    // check markers are present
    } else if (!(startWave.markers['end'] &&
      transitionWave.markers['start'] &&
      transitionWave.markers['end'] &&
      endWave.markers['start'])) {
      valid = false;
    }
    if (!valid) {
      return alert("All three waves must be loaded and marked before submission.");
    }
    //
    // /validation
    //

    // update volumes
    startWave.song.volume = $('#startWave .volumeSlider').data('slider').getValue();
    endWave.song.volume = $('#endWave .volumeSlider').data('slider').getValue();

    // upload samples
    uploadSong(startWave);
    uploadSong(endWave);
    uploadTransition(startWave, transitionWave, endWave);
    alert("Transition successfully uploaded!");
  }
};

function uploadTransition(startWave, transitionWave, endWave) {
  var startSongEnd = startWave.markers['end'].position;
  var endSongStart = endWave.markers['start'].position;

  var startTime = transitionWave.markers['start'].position;
  var endTime = transitionWave.markers['end'].position;

  var startSong = Songs.findOne({ 'name': startWave.song.name });
  var endSong = Songs.findOne({ 'name': endWave.song.name });

  // get transition metadata, or make if wave doesn't have it
  var transition = transitionWave.transition || {
    'type': 'transition',
    'transitionType': 'active',
    // TODO: make this based on given buffer's file name extension
    'fileType': 'mp3',
    'startSong': startSong._id,
    'endSong': endSong._id,
    'dj': transitionWave.dj
  };
  // add transition to database and s3 server if doesnt already exist
  if (!transition._id) {
    transition._id = Transitions.insert(transition);
    // upload transition to s3 server
    var url = Mixer.getSampleUrl(transition);
    uploadWave(transitionWave, url);
  }
  // update transition with timings and volume
  Transitions.update({ '_id': transition._id }, { $set:
    {
      'startSongEnd': startSongEnd,
      'endSongStart': endSongStart,
      'startTime': startTime,
      'endTime': endTime,
      'volume': $('#transitionWave .volumeSlider').data('slider').getValue()
    }
  });
}

function uploadSong(wave) {
  var song = wave.song;
  // if song is new, add to database and upload wave
  if (!song._id) {
    song._id = Songs.insert(song);
    // upload song to s3 server
    var url = Mixer.getSampleUrl(wave.song);
    uploadWave(wave, url);
  }
  // otherwise, just update song volume
  else {
    Songs.update(
      { '_id': song._id },
      { $set: { 'volume': song.volume } }
    );
  }
}

// uploads buffer of given wave to given s3 url
function uploadWave(wave, url) {
  console.log("uploading wave to url: "+url);
  console.log(wave);
  Meteor.call('putArray', wave.array, url);
}