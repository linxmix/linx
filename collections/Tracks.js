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
      volume: normalizedVolume ? normalizedVolume : this.get('volume')
    });
    console.log("set echonest", attrs, normalizedVolume);
  },

  setSoundcloud: function(attrs) {
    console.log("set soundcloud", attrs);
    this.set({
      soundcloud: attrs,
      title: attrs.title,
      artist: attrs.user && attrs.user.username,
    });
  },

  loadMp3Tags: function(file) {
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

  getS3Url: function() {
    // source from audioFile first
    var audioFile = this.audioFile();
    return (audioFile && audioFile.get('dataUrl')) || this.get('s3Url');
  },

  getStreamUrl: function(source) {
    source = source || this.getSource();
    switch (source) {
      case 'soundcloud': return this.getSoundcloudUrl();
      case 's3': return this.getS3Url();
      default: throw 'Uknown source given to getStreamUrl: ' + source;
    }
  },

  getSource: function() {
    if (this.get('soundcloud')) {
      return 'soundcloud';
    } else {
      return 's3';
    }
  },

  getS3Prefix: function() {
    return this.get('type') + 's';
  },

  setAudioFile: function(file) {
    var track = this;
    var fileModel = track.audioFile() || AudioFiles.create({ trackId: track.get('_id') });

    fileModel.setFile(file, {
      onLoading: function(percent) {
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

    track.loadMp3Tags(file);
  },

  isLoading: function() {
    return !!this.get('loading');
  },

  saveToBackend: function(cb) {
    var track = this;
    var fileModel = track.audioFile();

    if (!(track && fileModel && fileModel.getFile())) {
      throw new Error('Cannot upload track without file: ' + track.get('title'));
    }
    console.log("saving to backend", track.get('title'));

    // on completion, persist track and fire finish event
    function next() {
      track.store();
      cb && cb();
    }

    // upload to appropriate backend
    switch (track.getSource()) {
      case 's3': track._uploadToS3(next); break;
      case 'soundcloud': next(); break; // already exists on SC
      default: throw "Error: unknown track source: " + track.getSource();
    }
  },

  _uploadToS3: function(cb) {
    var track = this;

    track.audioFile().upload({
      onLoading: function(percent) {
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

  fetchEchonestAnalysis: function(cb) {
    var track = this;

    // If already have analysis, short circuit
    if (this.getAnalysis()) {
      // console.log("Track already has echonest analysis, skipping", this.get('title'));
      cb && cb();
    } else {

      // fetch profile before analyzing
      track.fetchEchonestProfile(function() {
        var loadingInterval = track.setLoadingInterval({
          type: 'analyze',
          time: 10000,
        });

        // attempt 5 times with 3 seconds between each.
        var count = 0;
        function attempt() {
          // console.log("fetching echonest analysis: ", "attempt: " + count, track);

          $.ajax({
            type: "GET",
            url: track.get('echonest.audio_summary.analysis_url'),
            success: function(response) {
              Meteor.clearInterval(loadingInterval);
              track.set('loading', false);
              track.setAnalysis(response);
              cb && cb();
            },
            error: function(xhr) {
              // retry on error
              if (count++ <= 5) {
                Meteor.setTimeout(attempt, 3000);
              } else {
                Meteor.clearInterval(loadingInterval);
                track.set('loading', false);
                console.error(xhr);
                throw new Error('Failed to get echonest analysis for track: ' + track.get('title'));
              }
            },
          });
        }

        attempt();
      });
    }
  },

  fetchEchonestProfile: function(cb) {
    var track = this;
    // first get echonestId of track
    this.fetchEchonestId(function(echonestId) {
      // console.log("fetching echonest profile", track.get('title'));
      var loadingInterval = track.setLoadingInterval({
        type: 'profile',
        time: 1000
      });

      // send profile request
      $.ajax({
        type: "GET",
        url: 'http://developer.echonest.com/api/v4/track/profile',
        cache: false, // do not cache so we get a fresh analysis_url
        data: {
          api_key: Config.apiKey_Echonest,
          bucket: 'audio_summary',
          format: 'json',
          id: echonestId,
        },
        success: function(response) {
          Meteor.clearInterval(loadingInterval);
          track.set('loading', false);
          track.setEchonest(Graviton.getProperty(response, 'response.track'));
          cb && cb();
        },
        error: function() {
          Meteor.clearInterval(loadingInterval);
          track.set('loading', false);
          throw new Error('Failed to get echonest profile for track: ' + track.get('title'));
        }
      });      
    });
  },

  fetchEchonestId: function(cb) {
    var track = this;

    // short-circuit if we already have the id
    if (track.get('echonest.id')) {
      // console.log("track already has echonest id, skipping", track);
      cb && cb(track.get('echonest.id'));
    } else {
      // console.log("getting echonestId of track", track);
      var streamUrl = track.getStreamUrl();
      var loadingInterval = track.setLoadingInterval({
        type: 'profile',
        // time: wave.getCrossloadTime(track.getSource())
        time: 10000, // TODO: get crossload time
      });

      // start upload
      $.ajax({
        type: "POST",
        url: 'http://developer.echonest.com/api/v4/track/upload',
        data: {
          api_key: Config.apiKey_Echonest,
          url: streamUrl
        },
        success: function(response) {
          Meteor.clearInterval(loadingInterval);
          track.set('loading', false);
          cb && cb(Graviton.getProperty(response, 'response.track.id'));
        },
        error: function(xhr) {
          Meteor.clearInterval(loadingInterval);
          track.set('loading', false);
          console.error(xhr);
          throw new Error('Failed upload track to echonest: ' + track.get('title'));
        },
      });
    }
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
