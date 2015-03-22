Utils = {

  setMixPoint: function(mixPoint, inWave, outWave) {
    console.log("setting mix point", mixPoint, inWave.getMeta('title'), outWave.getMeta('title'));
    inWave.setMixOut(mixPoint._id, inWave);
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

  // TODO
  // migrate transitions from linx meteor v1 to linx meteor v2
  migrateOldLinx: function(songs, transitions) {
    var userId = Meteor.userId();
    if (!userId) {
      throw new Error("must be logged in to migrate old linx db")
    }

    // build tracks from songs
    songs.forEach(function(song) {
      var track = Tracks.create({
        _id: song._id,
        createdBy: userId,
        title: song.title,
        artist: song.artist,
        s3FileName: song._id + song.fileType,
        type: "song",
        flags: [],
        playCount: song.playCount,
      });
    });

    var fromTrack = Tracks.findOne(transition.startSong);
    var toTrack = Tracks.findOne(transition.endSong);

    // build tracks and links from transitions
    transitions.forEach(function(transition) {
      // create transition track
      var transitionTrack = Tracks.create({
        _id: transition._id,
        createdBy: userId,
        title: fromTrack.get('title') + ' - ' + toTrack.get('title'),
        artist: transition.dj,
        s3FileName: transition._id + transition.fileType,
        type: "transition",
        flags: [],
        playCount: transition.playCount,
      });

      // create link from startSong -> transition
      var link1 = Links.create({
        createdBy: userId,

        fromTrackId: transition.startSong,
        toTrackId: transition._id,

        fromTime: transition.startSongEnd,
        toTime: transition.startTime,

        fromVol: transition.startSongVolume,
        toVol: transition.volume,

        playCount: transition.playCount,
      });

      // create link from transition -> endSong
      var link2 = Links.create({
        createdBy: userId,

        fromTrackId: transition._id,
        toTrackId: transition.endSong,

        fromTime: transition.endTime,
        toTime: transition.endSongStart,

        fromVol: transition.volume,
        toVol: transition.endSongVolume,

        playCount: transition.playCount,
      });

    });

  }
};
