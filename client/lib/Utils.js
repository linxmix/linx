Utils = {
  createLocalModel: function(collection, attrs) {
    attrs = attrs || {};
    attrs._local = true;
    var newId = collection._collection.insert(attrs);
    var newModel = collection.findOne(newId);
    return newModel;
  },

  createWaveSurfer: function() {
    var wave = Object.create(WaveSurfer);
    wave.loaded = new ReactiveVar(false);
    wave.loading = new ReactiveVar(false);
    wave.meta = new ReactiveVar(null);
    wave.loadingIntervals = [];
    return wave;
  },

  // migrate transitions from linx meteor v1 to linx meteor v2
  migrateTransitions: function(transitions) {
    transitions.forEach(function(transition) {
      transition.outId = transition.endSong;
      delete transition.endSong;
      transition.startOut = transition.endSongStart;
      delete transition.endSongStart;
      transition.endEdge = transition.endTime;
      delete transition.endTime;
      transition.inId = transition.startSong;
      delete transition.startSong;
      transition.endIn = transition.startSongEnd;
      delete transition.startSongEnd;
      transition.startEdge = transition.startTime;
      delete transition.startTime;

      var _id = transition._id;
      delete transition._id;
      Transitions.update(_id, {
        $set: transition,
        $unset: {
          endSong: '',
          endSongStart: '',
          endTime: '',
          startSong: '',
          startSongEnd: '',
          startTime: '',
        },
      });
    });
  }
};
