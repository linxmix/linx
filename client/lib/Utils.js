Utils = {

  setMixPoint: function(mixPoint, inWave, outWave) {
    inWave.setMixOut(mixPoint._id);
    outWave.setMixIn(mixPoint._id);
    var mixOutRegion = inWave.getRegion(mixPoint._id);
    mixOutRegion.on('in', function() {
      inWave.pause();
      outWave.play(mixPoint.startOut);
    });
  },

  withErrorHandling: function(fn, name) {
    return function() {
      try {
        if (Session.get('debug')) {
          console.log("DEBUG: calling method '" + name + "' with args: ", arguments);
        }
        return fn.apply(this, arguments);
      } catch (error) {
        console.error(error.stack);
        if (this.fireEvent) {
          this.fireEvent('error', error && error.message || error);
        } else {
          throw error;
        }
      }
    };
  },

  createLocalModel: function(collection, attrs) {
    attrs = attrs || {};
    attrs._local = true;
    var newId = collection._collection.insert(attrs);
    var newModel = collection.findOne(newId);
    return newModel;
  },

  createWaveSurfer: function() {
    var wave = Object.create(WaveSurfer);

    // initialize vars
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
