Template.Track_Wave.created = function() {
  var wave = Waves.create();
  console.log("create wave", wave.get('_id'));
  this._idWave = wave.get('_id');
  prepWaveSurfer(wave, this);
};

Template.Track_Wave.destroyed = function() {
  var wave = getWave(this);
  wave.destroyWaveSurfer();
};

Template.Track_Wave.rendered = function() {
  console.log("render wave");
  var template = this;
  var wave = getWave(template);
  var wavesurfer = wave.getWaveSurfer();

  template.$('.progress-bar').hide();

  wavesurfer.init({
    container: template.$('.wave')[0],
    waveColor: 'violet',
    progressColor: 'purple',
    cursorColor: 'white',
    minPxPerSec: 10,
    height: 150,
    fillParent: true,
    cursorWidth: 2,
    renderer: 'Canvas',
  });

  if (template.enableDragSelection) {
    wavesurfer.enableDragSelection({
      id: 'selected',
      color: 'rgba(255, 255, 255, 0.4)',
      loop: false,
    });
  }

  // load track if given
  var track = Tracks.findOne(template.data._idTrack);
  if (track) {
    wave.loadTrack(track);
  }
};

Template.Track_Wave.helpers({
  _idWave: function() {
    return Template.instance()._idWave;
  },

  waveClass: function() {
    var wave = getWave(Template.instance());
    return wave.get('loaded') ? '' : 'hidden';
  },

  trackTitle: function() {
    var track = getTrack(Template.instance());
    return (track && track.get('title')) || 'No Title';
  },

  trackArtist: function() {
    var track = getTrack(Template.instance());
    return (track && track.get('artist')) || 'No Artist';
  },

  isLoaded: function() {
    var wave = getWave(Template.instance());
    return wave.get('loaded');
  },

  isLoading: function() {
    var wave = getWave(Template.instance());
    return wave.get('loading');
  },

  onSubmitSoundcloud: function() {
    var wave = getWave(Template.instance());
    // create new track with given response
    return function(response) {
      var newTrack = Tracks.build();
      newTrack.setSoundcloud(response);
      wave.loadTrack(newTrack);
    };
  },

  onSelectLinx: function() {
    var wave = getWave(Template.instance());
    return function(track, results) {
      wave.loadTrack(track);
    };
  }
});

function prepWaveSurfer(wave, template) {
  var wavesurfer = wave.createWaveSurfer();
  wavesurfer.model = wave;

  var lastPercent;
  wavesurfer.on('loading', function(percent, xhr, type) {
    wave.set('loading', true);
    wave.save();
    template.$('.progress-bar').show();

    // update progress bar
    if (percent !== lastPercent) {
      lastPercent = percent;
      var text = {};
      switch (type) {
        case 'upload': text = { active: "Uploading...", success: "Uploaded!" }; break;
        case 'profile': text = { active: "Getting Profile...", success: "Got Profile!" }; break;
        case 'analyze': text = { active: "Analyzing...", success: "Analyzed!" }; break;
        default: text = { active: "Loading...", success: "Decoding..." };
      }
      template.$('.progress-bar').progress({
        percent: percent,
        text: text,
      });
    }
  });

  wavesurfer.on('uploadFinish', function() {
    template.$('.progress-bar').hide();
  });

  wavesurfer.on('ready', function() {
    template.$('.progress-bar').hide();
    template.data.onReady && template.data.onReady(template.data.deck, getWave(template).get('trackId'));
  });

  wavesurfer.on('reset', function() {
    template.$('.progress-bar').hide();
    template.data.onReset && template.data.onReset(template.data.deck);
  });

  wavesurfer.on('error', function(errorMessage) {
    template.$('.progress-bar').hide();
  });
}

function getWave(template) {
  return Waves.findOne(template._idWave);
}

function getTrack(template) {
  var wave = getWave(template);
  return wave.track();
}
