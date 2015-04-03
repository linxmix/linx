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
    return function(track) {
      // TODO: can we modify Template.currentData()? how else to do this? set _id then refresh? make this a copy?
      var track = Template.currentData().track;
    }.bind(this);
  },

});

function initWave(template) {

  // bail if we aren't ready
  if (!template.isRendered) {
    return;
  }

  // Initialize wave
  var track = getTrack(template);
  track.initWave(template);
}
