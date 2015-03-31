Utils = {

  // find all links to and from track a and track b
  findAllLinks: function(_idA, _idB) {
    if (!Tracks.findOne(_idA)) {
      return Links.find({
        $or: [{
          fromTrackId: _idB,
        }, {
          toTrackId: _idB,
        }]
      }).fetch();
    } else if (!Tracks.findOne(_idB)) {
      return Links.find({
        $or: [{
          fromTrackId: _idA,
        }, {
          toTrackId: _idA,
        }]
      }).fetch();
    } else {
      return Links.find({
        $or: [{
          fromTrackId: _idA,
          toTrackId: _idB,
        }, {
          fromTrackId: _idB,
          toTrackId: _idA,
        }]
      }).fetch();
    }
  },

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
        title: song.title || song.name,
        artist: song.artist,
        s3FileName: song._id + "." + song.fileType,
        type: "song",
        flags: [],
        playCount: song.playCount,
      });
      console.log("made song track", track);
    });


    // build tracks and links from transitions
    transitions.forEach(function(transition) {
      var fromTrack = Tracks.findOne(transition.startSong);
      var toTrack = Tracks.findOne(transition.endSong);

      // create transition track
      var transitionTrack = Tracks.create({
        _id: transition._id,
        createdBy: userId,
        title: fromTrack.get('title') + ' - ' + toTrack.get('title'),
        artist: transition.dj,
        s3FileName: transition._id + '.' + transition.fileType,
        type: "transition",
        flags: [],
        playCount: transition.playCount,
      });
      console.log("made transition track", transitionTrack);

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
      console.log("made link1", link1);

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
      console.log("made link2", link2);

    });

  }
};
