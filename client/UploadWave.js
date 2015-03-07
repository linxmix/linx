Template.UploadWave.created = function() {
  var file = this.data.file = new ReactiveVar(null);

  this.data.wave.on('reset', function() {
    file.set(null);
  });

  this.autorun(loadFile.bind(this));
};

Template.UploadWave.helpers({
  file: function() {
    return Template.instance().data.file;
  },

  onSubmitSoundcloud: function() {
    var data = Template.instance().data;
    // create new track with given soundcloudAttrs
    return function(soundcloudAttrs) {
      var newTrack = makeNewTrack({
        linxType: data.isTransition ? 'transition' : 'song'
      });
      newTrack.setSoundcloud(soundcloudAttrs);
      data.wave.loadTrack(newTrack, newTrack.getStreamUrl());
    };
  },

  onSelectLinx: function() {
    var template = Template.instance();
    return function(track, results) {
      template.data.wave.loadTrack(track, track.getStreamUrl());
    };
  }
});

function loadFile(computation) {
  var data = this.data;
  var file = data.file.get();

  // Load file and get mp3 data
  if (file) {
    var wave = data.wave;
    wave.loadBlob(file);

    var newTrack = makeNewTrack({
      linxType: data.isTransition ? 'transition' : 'song'
    });
    newTrack.loadMp3Tags(file);
    wave.loadTrack(newTrack);

  }
}

function makeNewTrack(attrs) {
  console.log("makeNewTrack", attrs);
  var collection = attrs.linxType === 'transition' ? Transitions : Songs;
  return Utils.createLocalModel(collection, attrs);
}
