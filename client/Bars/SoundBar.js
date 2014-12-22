Session.setDefault("queue", []);
Session.setDefault("soundBarPlaying", false);
Session.setDefault("soundBarOpen", false);

// private vars
var activeWave = new ReactiveVar(0);
var waves = [];


/*********************/
/***** SOUND BAR *****/
/*********************/

Template.SoundBar.created = function() {
  // create waves
  for (var i = 0; i < Session.get('queueBufferLength'); i++) {
    var wave = Object.create(WaveSurfer);
    wave.queueId = i;
    waves.push(wave);
    wave.on('finish', cycleQueue);
  }

  Tracker.autorun(assertPlay);
};

Template.SoundBar.rendered = function() {
  var $soundbar = $('.top.sidebar');
  $soundbar.sidebar({
    dimPage: false,
    transition: 'push',
    onChange: function() {
      Session.set('soundBarOpen', $soundbar.sidebar('is hidden'));
    },
  });
  $soundbar.sidebar('attach events', '.soundbar-launch', 'toggle');
};

Template.SoundBar.helpers({
  waves: function() {
    return waves;
  },

  waveClass: function() {
    var id = this.queueId;
    var activeId = activeWave.get();
    return id === activeId ? '' : 'hidden-wave';
  }
});


/*******************/
/***** HELPERS *****/
/*******************/

function cycleQueue() {
  // increment activeWave
  var prev = activeWave.get()
  var next = (prev + 1) % Session.get('queueBufferLength');
  activeWave.set(next);
}

function assertPlay(computation) {
  var activeId = activeWave.get();
  waves.forEach(function(wave) {
    wave.isLoaded && wave.pause();
  });

  if (Session.get('soundBarPlaying')) {
    var active = waves[activeId];
    active.isLoaded && active.play();
  }
}
