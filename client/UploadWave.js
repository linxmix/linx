Template.UploadWave.created = function() {
  var files = this.data.files = new ReactiveVar(null);

  this.data.wave.on('reset', function() {
    files.set(null);
  });

  this.autorun(loadFiles.bind(this));
};

Template.UploadWave.helpers({
  files: function() {
    return Template.instance().data.files;
  },

  onSubmitSoundcloud: function() {
    var data = Template.instance().data;
    // create new track with given soundcloudAttrs
    return function(soundcloudAttrs) {
      var newTrack = makeNewTrack({
        linxType: data.isTransition ? 'transition' : 'song'
      });
      data.wave.loadTrack(newTrack);
      data.wave.setSoundcloud(soundcloudAttrs);
    };
  },

  onSelectLinx: function() {
    var template = Template.instance();
    return function(track, results) {
      template.data.wave.loadTrack(track, track.getStreamUrl());
    };
  }
});

function loadFiles(computation) {
  var data = this.data;
  var files = data.files.get();
  var wave = data.wave;

  // Load files and get mp3 data
  if (files && wave.files !== files) {
    var file = files[0];
    wave.files = files;
    wave.loadBlob(file);

    var newTrack = makeNewTrack({
      linxType: data.isTransition ? 'transition' : 'song'
    });
    wave.loadTrack(newTrack);
    wave.loadMp3Tags(file);
  }
}

function makeNewTrack(attrs) {
  console.log("makeNewTrack", attrs);
  var collection = attrs.linxType === 'transition' ? Transitions : Songs;
  return Utils.createLocalModel(collection, attrs);
}
