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
    Session.equals("open_dialog", undefined)) {
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

  'upload': Uploader.upload
};