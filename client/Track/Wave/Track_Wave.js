Template.Track_Wave.created = function() {
  Utils.initTemplateModel.call(this, 'track', function(newModel, prevModel) {
    console.log("model changed", newModel, prevModel);
    initWave(this);
  });
};

Template.Track_Wave.destroyed = function() {
  Template.currentData().track.destroyWave();
};

Template.Track_Wave.rendered = function() {
  this.isRendered = true;
  initWave(this);
};

// TODO: how to better default wave before template is rendered?
function getWave() {
  var track = Template.currentData().track;
  return track.get('wave') || Waves.build();
}

Template.Track_Wave.helpers({
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
    var track = Template.currentData().track;
    // load response into track, then load wave
    return function(response) {
      track.setSoundcloud(response);
    }.bind(Template.instance());
  },

  onSelectLinx: function() {
    var track = Template.currentData().track;
    // clone selected, then load wave
    return function(selectedTrack) {
      track.cloneFrom(selectedTrack);
      console.log("selctLinx", track, selectedTrack)
    }.bind(Template.instance());
  },

  onDropTrack: function() {
    var track = Template.currentData().track;
    // load files into track
    return function(files) {
      track.loadFiles(files);
    }.bind(Template.instance());
  }
});

function initWave(template) {
  if (!template.isRendered) {
    return;
  }

  // Initialize wave
  var track = Template.currentData().track;
  console.log("init wave", track)
  track.initWave(template);
}
