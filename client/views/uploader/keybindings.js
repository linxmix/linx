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
    'left/shift+left': function(e) { handleEvent(e, 'markStart'); },
    'right/shift+right': function(e) { handleEvent(e, 'markEnd'); },
    'down/shift+down': function(e) { handleEvent(e, 'back'); },
    'up/shift+up': function(e) { handleEvent(e, 'forth'); },
    'tab': function(e) { handleEvent(e, 'focusForth'); },
    'shift+tab': function(e) { handleEvent(e, 'focusBack'); },
  });
}

//
// event handlers
//

function handleEvent(e, action) {
  // make sure we are on uploader page and no modals are open
  if ((Meteor.router.nav() === 'uploaderPage') &&
    Session.equals("open_dialog", undefined)) {
    // prevent default and propagation
    e.preventDefault();
    // figure out the id of this wave
    var id = (e.target && e.target.dataset && e.target.dataset.id) ||
      Session.get("wave_focus");
    // call appropriate event handler
    eventHandlers[action](e, id);
  }
}

var eventHandlers = {

  'playPause': function(e, id) {
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

  'upload': Uploader.upload
};