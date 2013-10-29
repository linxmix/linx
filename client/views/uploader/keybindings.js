//
// global handleKey
//
handleKeyEvent = function(e, action, id) {
  // make sure action exists
  if (action && action in eventHandlers) {

    // make sure we are on uploader page and no modals are open
    if ((Meteor.router.nav() === 'uploaderPage') &&
      Session.equals("open_modal", undefined)) {

      // prevent default and propagation
      e.preventDefault();
      // figure out the id of this wave
      id = id || (e.target && e.target.dataset && e.target.dataset.id) ||
        Session.get("wave_focus");
      // call appropriate event handler
      eventHandlers[action](e, id);

    // otherwise, allow default key behaviour
    } else {
      return true;
    }
  } else {
    return true;
  }
};

//
// key events
//

// hack to wait for Meteor.Keybindings to load
var keyBindingsInterval = Meteor.setInterval(function(){
   if (Meteor.Keybindings) {
     Meteor.clearInterval(keyBindingsInterval);
     addKeyBindings();
   }
}, 500);

function addKeyBindings() {
  Meteor.Keybindings.add({
    'space/shift+space': function(e) { handleKeyEvent(e, 'playPause'); },
    'left/shift+left': function(e) { handleKeyEvent(e, 'markStart'); },
    'right/shift+right': function(e) { handleKeyEvent(e, 'markEnd'); },
    'down/shift+down': function(e) { handleKeyEvent(e, 'back'); },
    'up/shift+up': function(e) { handleKeyEvent(e, 'forth'); },
    'tab': function(e) { handleKeyEvent(e, 'focusForth'); },
    'shift+tab': function(e) { handleKeyEvent(e, 'focusBack'); },
    'enter': function(e) { handleKeyEvent(e, 'openSelectModal'); },
    'z/shift+z': function(e) { handleKeyEvent(e, 'zoomOut'); },
    'a/shift+a': function(e) { handleKeyEvent(e, 'zoomIn' ); },
  });
}

//
// event handlers
//
var eventHandlers = {

  'playPause': function(e, id) {
    var wave = Uploader.waves[id],
        playing = Uploader.waves['playing'],
        lastPlay = Uploader.waves['lastPlay'];

    // redirect shift presses
    if (e.shiftKey) {
      seekLastPlayPos(e, id);
    }

    // we want this to be a universal pause
    else if (wave.id === (playing && playing.id)) {
      Uploader.pause();
    }

    // this wave isn't already playing, so play it and update lastPlay
    else {
      // if lastPlay, clear its mark
      if (lastPlay) {
        Wave.clearMark(lastPlay, 'lastPlay');
      }
      Uploader.waves['lastPlay'] = wave;
      Wave.markPlay(wave, Wave.getPosition(wave));
      Uploader.playWave(wave);
    }
  },

  'markStart': function(e, id) {
    var wave = Uploader.waves[id];
    // if shift is held, snap progress to startMarker
    if (e && e.shiftKey) {
      wave.seekTo(wave.markers['start'].position / Wave.getDuration(wave));
    // otherwise, mark start at current progress
    } else {
    Wave.markStart(wave);
    }
  },

  'markEnd': function(e, id) {
    var wave = Uploader.waves[id];
    // if shift is held, snap progress to endMarker
    if (e && e.shiftKey) {
      wave.seekTo(wave.markers['end'].position / Wave.getDuration(wave));
    // otherwise, mark end at current progress  
    } else {
    Wave.markEnd(wave);
    }
  },

  'back': function(e, id) {
    var dist = -0.005;
    if (e && e.shiftKey) {
       dist *= 50;
    }
    Uploader.waves[id].skip(dist);
  },

  'forth': function(e, id) {
    var dist = 0.005;
    if (e && e.shiftKey) {
       dist *= 50;
    }
    Uploader.waves[id].skip(dist);
  },

  'focusBack': function (e, id) {
    Uploader.cycleFocus(id, -1);
  },

  'focusForth': function (e, id) {
    Uploader.cycleFocus(id, 1);
  },

  'zoomOut': function (e, id) {
    zoomWave(e, id, -1);
  },

  'zoomIn': function (e, id) {
    zoomWave(e, id, 1);
  },

  'openSelectModal': function (e, id) {
    if (id === 'transitionWave') {
      Modal.openModal("transition_select", id);
    } else {
      Modal.openModal("song_select", id);
    }
  },

  'upload': Uploader.upload,

};

function zoomWave(e, id, direction) {
  // only do this if we have a file buffer loaded
  var wave = Uploader.waves[id];
  if (wave.backend.buffer) {
    var zoom = 1;
    if (e.shiftKey) {
      zoom *= 10;
    }
    Wave.zoom(wave, zoom * direction, true);
  }
}

// find wave with lastPlay marker and seek there
function seekLastPlayPos(e, id) {
  var lastPlay = Uploader.waves['lastPlay'];
  if (lastPlay) {
    var progress = (lastPlay.markers['lastPlay'] &&
      lastPlay.markers['lastPlay'].percentage);
    lastPlay.seekTo(progress);
    Uploader.pause();
    Session.set("wave_focus", lastPlay.id);
  }
}