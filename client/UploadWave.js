Template.UploadWave.created = function() {
  var file = this.data.file = new ReactiveVar(null);

  this.data.wave.on('empty', function() {
    file.set(null);
  });

  this.autorun(loadFile.bind(this));
};

Template.UploadWave.helpers({
  file: function() {
    return Template.instance().data.file;
  },

  onSubmitSoundcloud: function() {
    var template = Template.instance();
    // create new song with given soundcloudAttrs
    return function(soundcloudAttrs) {
      var newTrack = Utils.createLocalModel(Songs);
      newTrack.setSoundcloud(soundcloudAttrs);
      template.data.wave.loadTrack(newTrack, newTrack.getStreamUrl());
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
  var file = this.data.file.get();

  // create new track from file, load wave
  if (file) {
    var wave = this.data.wave;
    var collection = this.data.isTransition ? Transitions : Songs;
    var newTrack = Utils.createLocalModel(collection, {title: file.name});
    wave.loadBlob(file);
    wave.loadTrack(newTrack);
  }
}
