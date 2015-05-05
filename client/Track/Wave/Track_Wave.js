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
  this.autorun(this.wave.assertVolume.bind(this.wave));

  // autorun track loading
  this.autorun(function() {
    var template = Template.instance();
    var track = template.data.track;
    var $progressBar = template.$('.progress-bar.trackLoading');
    if (!track) { return; }

    // not loading
    var loading = track.get('loading');
    if (!loading) { 
      $progressBar.progress({ percent: 0 });
      $progressBar.hide();
      return;

    // actually loading
    } else {
      var text = {};
      var options = loading;
      switch (options.type) {
        case 'upload': text = { active: "Uploading...", success: "Uploaded!" }; break;
        case 'profile': text = { active: "Getting Profile...", success: "Got Profile!" }; break;
        case 'analyze': text = { active: "Analyzing...", success: "Analyzed!" }; break;
        case 'load': default: text = { active: "Loading...", success: "Decoding..." };
      }

      // update progress bar
      $progressBar.show();
      if (_.isNumber(options.percent)) {
        $progressBar.progress({
          percent: options.percent,
          text: text,
        });
      }
    }
  }.bind(this));
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
