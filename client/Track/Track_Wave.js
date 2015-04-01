Template.Track_Wave.created = function() {
  var wave = Waves.create();
  this._idWave = wave.get('_id');
  prepWaveSurfer(wave, this);
};

Template.Track_Wave.destroyed = function() {
  var wave = getWave(this);
  wave.destroyWaveSurfer();
};

Template.Track_Wave.rendered = function() {
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
  var lastId;
  template.autorun(function() {
    var newId = Template.currentData()._idTrack;
    if (newId !== lastId) {
      lastId = newId;
      var track = Tracks.findOne(newId);
      console.log("load track if given", track);
      if (track) {
        getWave(template).loadTrack(track);
      }
    }
  });
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
    var template = Template.instance();
    // create new track with given response
    return function(response) {
      var wave = getWave(template);
      var newTrack = wave.createNewTrack();
      newTrack.setSoundcloud(response);
      wave.loadNewTrack(newTrack);
    };
  },

  onSelectLinx: function() {
    var template = Template.instance();
    return function(track) {
      var wave = getWave(template);
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
    var onReady = template.data.onReady;
    if (onReady) {
      var deck = template.data.deck;
      if (deck) {
        onReady(deck, getWave(template).get('trackId'));
      } else {
        onReady(getWave(template).get('trackId'));
      }
    }
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
  return wave.getTrack();
}
