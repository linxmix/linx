Template.Track_Wave.created = function() {
  Utils.initTemplateModel.call(this, 'track', function(newModel, prevModel) {
    initWave(this);
  });
};

Template.Track_Wave.destroyed = function() {
  getTrack(this).destroyWave();
};

Template.Track_Wave.rendered = function() {
  this.isRendered = true;
  initWave(this);
};

// TODO: how to better default wave before template is rendered?
function getWave(template) {
  return getTrack(template).get('wave') || Waves.build();
}

function getTrack(template) {
  return template.data.track;
}

Template.Track_Wave.helpers({
  hiddenClass: function() {
    var wave = getWave(Template.instance());
    return wave.get('loaded') ? '' : 'hidden';
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
    // load response into track, then load wave
    return function(response) {
      var track = getTrack(template);
      var wave = getWave(template);
      track.setSoundcloud(response);
      wave.loadTrack(track);
    };
  },

  onSelectLinx: function() {
    var template = Template.instance();
    // clone selected, then load wave
    return function(selectedTrack) {
      var track = getTrack(template);
      track.cloneFrom(selectedTrack);
    }.bind(this);
  },

  onDropTrack: function() {
    var template = Template.instance();
    // load files into track
    return function(files) {
      var track = getTrack(template);
      track.loadFiles(files);
    };
  }
});

function initWave(template) {
  if (!template.isRendered) {
    return;
  }

  // Initialize wave
  var track = getTrack(template);
  track.initWave(template);
}
