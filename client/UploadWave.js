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
    wave.loadBlob(file);

    // load mp3 file tags
    id3(file, function(err, tags) {
      console.log("TAGS", err, tags);
      var attrs;
      // fallback to filename on tag parse error
      if (err) {
        console.error(err);
        attrs = { title: file.name };
      } else {
        attrs = {
          title: tags.title,
          artist: tags.artist,
          album: tags.album,
        };
      }
      var newTrack = Utils.createLocalModel(collection, attrs);
      wave.loadTrack(newTrack);
    });

  }
}
