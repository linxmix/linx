/* global Tracks: true */
/* global TrackModel: true */
/* global Analyses: true */

Meteor.startup(function() {
  if (Meteor.isClient) {
    Analyses = {
      set: function(_id, analysis) {
        if (this[_id]) {
          this.destroy(_id);
        }
        this[_id] = new ReactiveVar(analysis);
      },
      get: function(_id) {
        var analysis = this[_id];
        return analysis && analysis.get();
      },
      destroy: function(_id) {
        delete this[_id];
      }
    };
  }
});

TrackModel = Graviton.Model.extend({
  belongsTo: {
    user: {
      collectionName: 'users',
      field: 'userId'
    },
  },
  hasOne: {
    audioFile: {
      collectionName: 'audiofiles',
      foreignKey: 'trackId',
    }
  },
  hasMany: {
    plays: {
      collectionName: 'plays',
      foreignKey: 'trackId',
    },
    mixelements: {
      collectionName: 'mixelements',
      foreignKey: 'trackId',
    },
    linksTo: {
      collectionName: 'links',
      foreignKey: 'toTrackId',
    },
    linksFrom: {
      collectionName: 'links',
      foreignKey: 'fromTrackId',
    }
  },
  defaults: {
    flags: [],
    title: 'New Track',
    artist: 'No Artist',
    type: 'song', // one of 'song', 'transition' or 'mix'
    volume: 1,

    loading: false,
  },
}, {
  setEchonest: function(attrs) {
    var normalizedVolume = normalizeVolume(Graviton.getProperty(attrs, 'audio_summary.loudness'));
    this.saveAttrs({
      echonest: attrs,      
      title: attrs.title,
      artist: attrs.artist,
      volume: normalizedVolume ? normalizedVolume : this.get('volume'),
      md5: attrs.md5
    });
    console.log("set echonest", attrs, normalizedVolume);
  },

  setSoundcloud: function(attrs) {
    console.log("set soundcloud", attrs);
    this.set({
      soundcloud: attrs,
      soundcloudId: attrs.id,
      title: attrs.title,
      artist: attrs.user && attrs.user.username,
    });
  },

  loadMp3Tags: function(file, cb) {
    id3(file, function(err, tags) {
      console.log("load tags", tags, file.name);
      var newAttrs = {};
      if (err) {
        console.error(err);
        newAttrs.title = file.name;
      } else {
        newAttrs.title = tags.title || file.name;
        newAttrs.artist = tags.artist || this.get('artist');
        newAttrs.album = tags.album;
        newAttrs.id3Tags = tags;
      }
      this.set(newAttrs);
      cb && cb(tags);
    }.bind(this));
  },

  getAllLinks: function() {
    return this.linksTo.all().concat(this.linksFrom.all());
  },

  getLinkToIds: function() {
    return this.linksTo.all().map(function(l) { return l.get('_id'); });
  },

  getLinkFromIds: function() {
    return this.linksFrom.all().map(function(l) { return l.get('_id'); });
  },

  getSoundcloudUrl: function() {
    var soundcloud = this.get('soundcloud');
    if (soundcloud && soundcloud.stream_url) {
      var clientId = Config.clientId_Soundcloud;
      return soundcloud.stream_url + '?client_id=' + clientId;
    } else {
      throw 'Could not get SoundcloudUrl for Song';
    }
  },

  getAudioFileUrl: function() {
    var audioFile = this.audioFile();
    return audioFile && audioFile.get('dataUrl');
  },

  getS3Url: function() {
    return this.get('s3Url');
  },

  // returns streamable url
  getStreamUrl: function(source) {
    source = source || this.getSource();
    switch (source) {
      case 'file': return this.getAudioFileUrl();
      case 'soundcloud': return this.getSoundcloudUrl();
      case 's3': return this.getS3Url();
    }
  },

  getSource: function(needsBackend) {
    if (!needsBackend && this.getAudioFileUrl()) {
      return 'file';
    } else if (this.get('soundcloud')) {
      return 'soundcloud';
    } else if (this.get('s3Url')) {
      return 's3';
    }
  },

  // gets source of actual backend, not file
  getBackendSource: function() {
    return this.getSource(true);
  },

  getS3Prefix: function() {
    return this.get('type') + 's';
  },

  setAudioFile: function(file) {
    var track = this;
    var fileModel = track.audioFile() || AudioFiles.create({ trackId: track.get('_id') });

    fileModel.setFile(file, {
      onProgress: function(percent) {
        track.set('loading', {
          type: 'load',
          percent: percent,
        });
      },
      onSuccess: function() {
        track.set('loading', false);
      },
      onError: function() {
        track.set('loading', false);
      }
    });

    // try to get track info from file
    // TODO: let user choose these
    track.loadMp3Tags(file, function() {
      fileModel.calcMD5({
        onSuccess: track.setMD5.bind(track)
      });
    });
  },

  setMD5: function(md5) {
    var track = this;
    md5 = md5.toLowerCase();

    // check if we already have track with track md5
    var matchingTracks = Tracks.find({
      md5: md5,
      isNew: false,
    }).fetch();
    if (matchingTracks.length) {
      console.log("successful md5 matches", matchingTracks);
      track.cloneFrom(matchingTracks[0]);

    // then check if echonest has track md5
    } else {
      track.set('md5', md5);
      Echonest.identifyTrackMD5(md5, {
        onSuccess: function(echonest) {
          console.log("identify success", echonest);
          this.setEchonest(echonest);
        },
      });
    }
  },

  isLoading: function() {
    return !!this.get('loading');
  },

  saveToBackend: function(cb) {
    var track = this;
    console.log("saving to backend", track.get('title'));

    // on completion, persist track and fire finish event
    function next() {
      track.store();
      cb && cb();
    }

    // upload to appropriate backend
    var source = track.getSource();
    switch (source) {
      case 'file': track._uploadToS3(next); break;
      case 'soundcloud': next(); break; // already exists on SC
      default: throw new Error("cannot upload track with source: " + source);
    }
  },

  _uploadToS3: function(cb) {
    var track = this;
    var fileModel = track.audioFile();

    if (!(track && fileModel && fileModel.getFile())) {
      throw new Error('Cannot upload track to s3 without file: ' + track.get('title'));
    }

    fileModel.upload({
      onProgress: function(percent) {
        track.set('loading', {
          type: 'upload',
          percent: percent
        });
      },
      onSuccess: function(downloadUrl) {
        track.set('loading', false);
        track.set({ s3Url: downloadUrl });
        cb && cb();
      },
      onError: function(error) {
        track.set('loading', false);
      }
    });
  },

  // given options.time and options.type, set an interval
  setLoadingInterval: function(options) {
    var percent = 0;
    var track = this;
    var loadingInterval = Meteor.setInterval(function() {
      track.set('loading', {
        percent: percent,
        type: options.type,
      });
      if (percent === 100) {
        Meteor.clearInterval(loadingInterval);
      }
      percent += 1;
    }, options.time / 100);
    return loadingInterval;
  },

  getAnalysis: function() {
    return Analyses.get(this.get('_id'));
  },

  setAnalysis: function(analysis) {
    return Analyses.set(this.get('_id'), analysis);
  },
});

function normalizeVolume(loudness) {
  if (!_.isNumber(loudness)) { return 0; }

  // expected loudness
  var LOUDNESS = -10;

  var gain = LOUDNESS - loudness;

  return Math.pow(10, gain / 20);
}

Tracks = Graviton.define("tracks", {
  modelCls: TrackModel,
  timestamps: true,
});

Tracks.allow({
  insert: Utils.isCreatingOwnDocument,
  update: Utils.ownsDocument,
  remove: Utils.ownsDocument
});
