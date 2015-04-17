Template.Track_Wave.created = function() {
  this.wave = this.data.wave || Waves.create();

  Utils.initTemplateModel.call(this, 'track', function(newModel, prevModel) {
    // if (prevModel) {
      // console.log("track wave model changed", newModel.get('title'), prevModel.get('title'));
    // }
    this.wave.setTrack(newModel);
  });
};

Template.Track_Wave.destroyed = function() {
  Template.instance().wave.destroyWaveSurfer();
};

Template.Track_Wave.rendered = function() {
  this.wave.init(this);
  this.autorun(this.wave.drawRegions.bind(this.wave));
};

function getWave() {
  return Template.instance().wave;
}

Template.Track_Wave.helpers({
  wave: function() {
    return Template.instance().wave;
  },

  hiddenClass: function() {
    var wave = getWave.call(this);
    return wave.get('loaded') ? '' : 'hidden';
  },

  isLoaded: function() {
    var wave = getWave.call(this);
    return wave.get('loaded');
  },

  isLoading: function() {
    var wave = getWave.call(this);
    return wave.get('loading');
  },

  onSubmitSoundcloud: function() {
    var template = Template.instance();
    var wave = template.wave;
    var track = wave.getTrack();
    // load response into track, then load wave
    return function(response) {
      track.setSoundcloud(response);
      wave.loadTrack();
    };
  },

  onSelectLinx: function() {
    var template = Template.instance();
    var wave = template.wave;
    var track = wave.getTrack();
    // clone selected, then load wave
    return function(selectedTrack) {
      track.cloneFrom(selectedTrack);
      wave.loadTrack();
    };
  },

  onDropTrack: function() {
    var template = Template.instance();
    var wave = template.wave;
    // load files into wave
    return function(files) {
      wave.loadFiles(files);
    };
  }
});
