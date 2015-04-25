Template.Track_Wave.created = function() {
  this.wave = this.data.wave || Waves.create();

  Utils.initTemplateModel.call(this, 'track', function(newModel, prevModel) {
    // console.log("track wave model changed", newModel && newModel.get('title'), prevModel && prevModel.get('title'));
    this.wave.setTrack(newModel);
  });
};

Template.Track_Wave.destroyed = function() {
  var wave = Template.instance().wave;
  wave.destroyWaveSurfer();
};

Template.Track_Wave.rendered = function() {
  this.wave.init(this);
  this.autorun(this.wave.drawRegions.bind(this.wave));
  this.autorun(this.wave.loadAudio.bind(this.wave));
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
    var isHidden = Template.currentData().isHidden;
    return !wave.get('loaded') || isHidden ? 'hidden' : '';
  },

  isLoaded: function() {
    var wave = getWave.call(this);
    return wave.get('loaded');
  },

  isLoading: function() {
    var wave = getWave.call(this);
    return wave.get('loading');
  },
});

Template.Track_Wave.events({
  'dblclick .wave': function(e, template) {
    var wave = getWave.call(this);
    wave.playpause();
  }
});
