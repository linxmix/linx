Template.Track_Wave.created = function() {
  // get or make wave
  var wave = this.wave = this.data.wave || Utils.createWaveSurfer();
  var files = this.data.files = new ReactiveVar(null);
  initWave.call(this);

  this.autorun(loadFiles.bind(this));
};

Template.Track_Wave.rendered = function() {
  this.$('.progress-bar').hide();
  this.wave.init({
    container: this.$('.wave')[0],
    waveColor: 'violet',
    progressColor: 'purple',
    cursorColor: 'white',
    minPxPerSec: 10,
    height: 150,
    fillParent: true,
    cursorWidth: 2,
    renderer: 'Canvas',
  });

  if (this.data.enableDragSelection) {
    this.wave.enableDragSelection({
      id: 'selected',
      color: 'rgba(255, 255, 255, 0.4)',
      // drag: false,
      // resize: false,
      loop: false,
    });
  }
};

Template.Track_Wave.helpers({
  hiddenClass: function() {
    return Template.instance().wave.isLoaded() ? '' : 'hidden';
  },

  isLoaded: function() {
    return Template.instance().wave.isLoaded();
  },

  wave: function() {
    return Template.instance().wave;
  },

  onSubmitSoundcloud: function() {
    var wave = Template.instance().wave;
    // create new track with given response
    return function(response) {
      var newTrack = Tracks.build();
      newTrack.setSoundcloud(response);
      wave.loadTrack(newTrack, newTrack.getStreamUrl());
    };
  },

  onSelectLinx: function() {
    var wave = Template.instance().wave;
    return function(track, results) {
      wave.loadTrack(track, track.getStreamUrl());
    };
  }
});

function initWave() {
  var template = this;
  var wave = this.wave;

  var lastPercent;
  wave.on('loading', function(percent, xhr, type) {
    wave.loading.set(true);
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

  wave.on('uploadFinish', function() {
    wave.loading.set(false);
    template.$('.progress-bar').hide();
  });

  wave.on('ready', function() {
    wave.loaded.set(true);
    wave.loading.set(false);
    template.$('.progress-bar').hide();
    template.data.onReady && template.data.onReady(wave);
  });

  wave.on('reset', function() {
    wave.loaded.set(false);
    wave.loading.set(false);
    template.$('.progress-bar').hide();
    template.files.set(null);
  });

  wave.on('error', function(errorMessage) {
    template.$('.progress-bar').hide();
    wave.loading.set(false);
    window.alert("Wave Error: " + (errorMessage || 'unknown error'));
  });


  // sync with wave.getMeta('regions')
  wave.on('region-created', wave._updateRegion.bind(wave));
  wave.on('region-updated-end', wave._updateRegion.bind(wave));
  wave.on('region-removed', wave._updateRegion.bind(wave));
}

function loadFiles(computation) {
  var data = this.data;
  var files = data.files.get();
  var wave = wave;

  // Load files and get mp3 data
  if (files && wave.files !== files) {
    var file = files[0];
    wave.files = files;
    wave.loadBlob(file);

    // TODO: move creation logic to wavesurfer.js
    var newTrack = Tracks.build();
    newTrack.loadMp3Tags(file);
    wave.loadTrack(newTrack);
  }
}
