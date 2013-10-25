//
// mouse events
//

// count mouse move events while click is held
var clickHeld = false;
Template.uploaderPage.events({

  //
  // click and hold events
  //
  // unset clickHeld
  'mouseup': function (e) {
    clickHeld = false;
  },
  // set clickHeld, reset movesMade
  'mousedown .waveform': function(e) {
    clickHeld = true;
    Uploader.movesMade = 0;
  },
  // increment movesMade while click is held
  'mousemove .waveform': function(e) {
    if (clickHeld) {
      Uploader.movesMade++;
    }
  },

  //
  // link button clicks to key event handler
  //
  'click button': function (e) {
    var action = e.target.dataset && e.target.dataset.action;
    // pass click to event handlers
    handleKeyEvent(e, action);
  }
});


// other wave events
Template.wave.events({

  //
  // area clicks
  //
  'click .wavePlayer': function(e) {
    Session.set("wave_focus", this.id);
  },

  'click .waveform': function(e) {
    Session.set("wave_focus", this.id);
  },
  
  'click .loadText': function (e) {
    Session.set("wave_focus", this.id);
  },

  'click .songLoadText': function(e) {
    Dialog.openDialog("song_select", this.id);
  },

  'click .transitionLoadText': function(e) {
    Dialog.openDialog("transition_select", this.id);
  },

  //
  // double click
  //
  'dblclick .waveform': function(e) {
    // pause uploader beforehand so this is always a play
    Uploader.pause();
    // trigger playPause
    handleKeyEvent(e, 'playPause', this.id);
  },

  //
  // hover
  //
  'mousemove .waveform': function(e) {
    var wave = Uploader.waves[this.id];
    //Session.set("wave_focus", this.id);

    // only do this if we have a file buffer loaded
    if (wave.backend && wave.backend.buffer) {
      // extract mouse position from event
      var relX = 'offsetX' in e ? e.offsetX : e.layerX;
      var position = (relX / wave.drawer.scrollWidth) || 0;
      // scale percent to duration
      position *= Wave.getDuration(wave);
      // mark hover position
      Wave.markHover(wave, position);
    }
  },

  'mouseout .waveform': function(e) {
    var wave = Uploader.waves[this.id];
    // only do this if we have a file buffer loaded
    if (wave.backend.buffer) {
      // clear hover marker
      Wave.markHover(wave, 0);
    }
  },

  //
  // scroll
  //
  'mousewheel .waveform': function (e) {
    // only do this if we have a file buffer loaded
    var wave = Uploader.waves[this.id];
    if (wave.backend.buffer) {
      var action = e.wheelDelta >= 0 ? 'zoomIn' : 'zoomOut';
      handleKeyEvent(e, action, wave.id);
    }
  },

});