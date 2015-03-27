Template.Track_Wave.created = function() {
  this.data = this.data || {};
  var wave = this.data.wave = Waves.create();
  var files = this.data.files = new ReactiveVar(null);

  prepWave.call(this, arguments);

  this.autorun(function() {
    var _files = files.get();
    // Load files and get mp3 data
    if (_files && _files !== wave.get('files')) {
      wave.loadFiles(_files);
    }
  });
};

Template.Track_Wave.rendered = function() {
  var template = this;
  var wave = template.data.wave;
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
      // drag: false,
      // resize: false,
      loop: false,
    });
  }

  if (template.data.track) {
    wave.loadTrack(template.data.track);
  }
};

Template.Track_Wave.helpers({
  hiddenClass: function() {
    return Template.instance().data.wave.get('loaded') ? '' : 'hidden';
  },

  isLoaded: function() {
    return Template.instance().data.wave.get('loaded');
  },

  wave: function() {
    return Template.instance().data.wave;
  },

  onSubmitSoundcloud: function() {
    var wave = Template.instance().data.wave;
    // create new track with given response
    return function(response) {
      var newTrack = Tracks.build();
      newTrack.setSoundcloud(response);
      wave.loadTrack(newTrack);
    };
  },

  onSelectLinx: function() {
    var wave = Template.instance().data.wave;
    return function(track, results) {
      wave.loadTrack(track);
    };
  }
});

function prepWave() {
  var template = this;
  var wave = template.data.wave;
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
  });

  wavesurfer.on('reset', function() {
    template.$('.progress-bar').hide();
    template.files.set(null);
  });

  wavesurfer.on('error', function(errorMessage) {
    template.$('.progress-bar').hide();
  });
}
