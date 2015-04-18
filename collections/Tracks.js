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
      field: 'createdBy'
    },
  },
  hasMany: {
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
    playCount: 0,
  },
}, {
  setEchonest: function(attrs) {
    console.log("set echonest", attrs);
    this.saveAttrs({
      echonest: attrs,      
      title: attrs.title,
      artist: attrs.artist,
    });
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
        newAttrs.artist = tags.artist;
        newAttrs.album = tags.album;
        newAttrs.id3Tags = tags;
      }
      this.set(newAttrs);
    }.bind(this));
  },

  loadFiles: function(files) {
    var file = files[0];
    this.getWave().loadFiles(files);
    this.loadMp3Tags(file);
  },

  getAllLinks: function() {
    return this.linksTo.all().concat(this.linksFrom.all());
  },

  getLinkToIds: function() {
    console.log('getlinktoids', this.linksTo.all().map(function(l) { return l.get('_id'); }))
    return this.linksTo.all().map(function(l) { return l.get('_id'); });
  },

  getLinkFromIds: function() {
    console.log('getlinkfromids', this.linksFrom.all().map(function(l) { return l.get('_id'); }))
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
    if (this.get('isNew')) { return; }
    var part = 'http://s3-us-west-2.amazonaws.com/linx-music/';
    // TODO: make this work for non-mp3
    var fileName = this.get('s3FileName') || this.get('_id') + '.mp3';
    return part + this.getS3Prefix() + '/' + fileName;
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

  getAnalysis: function() {
    return Analyses.get(this.get('_id'));
  },

  setAnalysis: function(analysis) {
    return Analyses.set(this.get('_id'), analysis);
  },

  fetchEchonestAnalysis: function(wave, cb) {
    var track = this;

    if (!(track && wave)) {
      throw new Error('Cannot fetch track analysis without wave' + this.get('title'));
    }
    // If already have analysis, short circuit
    if (this.getAnalysis()) {
      console.log("Track already has echonest analysis, skipping", this.get('title'));
      cb && cb();
    } else {

      // fetch profile before analyzing
      track.fetchEchonestProfile(wave, function() {
        var loadingInterval;

        function onSuccess(response) {
          Meteor.clearInterval(loadingInterval);
          wave.onUploadFinish.call(wave);
          track.setAnalysis(response);
          cb && cb();
        }

        // attempt 5 times with 3 seconds between each.
        var count = 0;
        function attempt() {
          loadingInterval = wave.setLoadingInterval({
            type: 'analyze',
            time: 3000
          });
          console.log("fetching echonest analysis: ", "attempt: " + count, track);

          $.ajax({
            type: "GET",
            url: track.get('echonest.audio_summary.analysis_url'),
            success: onSuccess,
            error: function(xhr) {
              Meteor.clearInterval(loadingInterval);
              // retry on error
              if (count++ <= 5) {
                Meteor.setTimeout(attempt, 3000);
              } else {
                wave.onError(xhr);
              }
            },
          });
        }

        attempt();
      });
    }
  },

  fetchEchonestProfile: function(wave, cb) {
    var track = this;
    // first get echonestId of track
    this.fetchEchonestId(wave, function(echonestId) {
      console.log("fetching echonest profile", track.get('title'));
      var loadingInterval = wave.setLoadingInterval({
        type: 'profile',
        time: 1000
      });

      function onSuccess(response) {
        Meteor.clearInterval(loadingInterval);
        wave.onUploadFinish();
        track.setEchonest(Graviton.getProperty(response, 'response.track'));
        cb && cb();
      }

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
        success: onSuccess,
        error: function() {
          wave.onError.apply(wave, arguments);
        }
      });      
    });
  },

  fetchEchonestId: function(wave, cb) {

    // short-circuit if we already have the id
    var track = this;
    if (track.get('echonest')) {
      console.log("track already has echonest id, skipping", track);
      cb && cb(track.get('echonest.id'));
    } else {
      console.log("getting echonestId of track", track);
      var streamUrl = track.getStreamUrl();
      var loadingInterval = wave.setLoadingInterval({
        type: 'profile',
        time: wave.getCrossloadTime(track.getSource())
      });

      function onSuccess(response) {
        Meteor.clearInterval(loadingInterval);
        wave.onUploadFinish();
        cb && cb(Graviton.getProperty(response, 'response.track.id'));
      }

      // start upload
      $.ajax({
        type: "POST",
        url: 'http://developer.echonest.com/api/v4/track/upload',
        data: {
          api_key: Config.apiKey_Echonest,
          url: streamUrl
        },
        success: onSuccess,
        error: function(xhr) {
          Meteor.clearInterval(loadingInterval);
          wave.fireEvent('error', 'echonest upload error: ' + xhr.responseText);
        },
      });
    }
  },
});

Tracks = Graviton.define("tracks", {
  modelCls: TrackModel,
  timestamps: true,
});

// TODO: either fill these out or move them into Meteor.methods
Tracks.allow({
  insert: function (userId, doc) {
    return true;
  },
  update: function (userId, docs, fields, modifier) {
    return true;
  },
  remove: function (userId, docs) {
    return true;
  }
});
