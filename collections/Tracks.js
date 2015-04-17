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
  // TODO: standardize this getting/setting of non-saved reactive vars (should be non saved? global store?)
  // createReactiveProp
  // maybe have global store of echonest analyses?
  setEchonestAnalysis: function(response) {
    this.echonestAnalysis = this.echonestAnalysis || new ReactiveVar();
    this.echonestAnalysis.set(response);
  },

  getEchonestAnalysis: function() {
    this.echonestAnalysis = this.echonestAnalysis || new ReactiveVar();
    return this.echonestAnalysis && this.echonestAnalysis.get();
  },

  setEchonest: function(attrs) {
    console.log("set echonest", attrs);
    this.set({
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
    if (!this.get('_id')) { return; }
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

  saveToBackend: function(cb) {
    var wave = this.getWave();
    var files = wave && wave.get('files');
    if (!(wave && files)) {
      throw new Error('Cannot upload a track without a wave and files: ' + this.get('title'));
    }
    console.log("uploading track", this.get('title'));

    // on completion, persist track and fire finish event
    var track = this;
    function next() {
      wave.onUploadFinish();
      track.save();
      cb && cb();
    }

    // upload to appropriate backend
    switch (track.getSource()) {
      case 's3': this._uploadToS3(next); break;
      case 'soundcloud': next(); break; // already exists on SC
      default: throw "Error: unknown track source: " + track.getSource();
    }
  },

  _uploadToS3: function(cb) {
    var track = this;
    var wave = this.getWave();

    // track progress
    var uploadFinished = false;
    Tracker.autorun(function(computation) {
      var uploads = S3.collection.find().fetch();
      var upload = uploads[0];
      if (upload) {
        var percent = upload.percent_uploaded;
        !uploadFinished && wave.onLoading({
          type: 'upload',
          percent: percent
        });
        if (percent === 100) {
          computation.stop();
        }
      }
    });

    S3.upload({
      files: wave.get('files'),
      path: track.getS3Prefix(),
    }, function(error, result) {
      uploadFinished = true;
      if (error) { throw error; }
      // update track with new s3FileName
      var urlParts = result.relative_url.split('/');
      var s3FileName = urlParts[urlParts.length - 1];
      track.set({ s3FileName: s3FileName });
      cb && cb(error, result);
    });
  },

  setLoadingInterval: function(options) {
    var percent = 0;
    var wave = this.getWave();
    var loadingInterval = Meteor.setInterval(function() {
      wave.onLoading.call(wave, {
        percent: percent,
        type: options.type,
      });
      if (percent === 100) {
        Meteor.clearInterval(loadingInterval);
      }
      percent += 1;
    }, options.time / 100);
    // wave.loadingIntervals.push(loadingInterval);
    return loadingInterval;
  },

  fetchEchonestAnalysis: function(cb) {

    // If already have analysis, short circuit
    if (this.getEchonestAnalysis()) {
      console.log("Track already has echonest analysis, skipping", this.get('title'));
      cb && cb();
    } else {
      var track = this;
      var wave = this.getWave();

      // fetch profile before analyzing
      track.fetchEchonestProfile(function() {
        var loadingInterval;

        function onSuccess(response) {
          Meteor.clearInterval(loadingInterval);
          wave.onUploadFinish.call(wave);
          track.setEchonestAnalysis(response);
          cb && cb();
        }

        // attempt 5 times with 3 seconds between each.
        var count = 0;
        function attempt() {
          loadingInterval = track.setLoadingInterval({
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

  fetchEchonestProfile: function(cb) {
    var wave = this.getWave();
    var track = this;
    // first get echonestId of track
    this.fetchEchonestId(function(echonestId) {
      console.log("fetching echonest profile", track.get('title'));
      var loadingInterval = track.setLoadingInterval({
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

  fetchEchonestId: function(cb) {

    // short-circuit if we already have the id
    var track = this;
    if (track.get('echonest')) {
      console.log("track already has echonest id, skipping", track);
      cb && cb(track.get('echonest.id'));
    } else {
      console.log("getting echonestId of track", track);
      var wave = track.getWave();
      var streamUrl = track.getStreamUrl();
      var loadingInterval = track.setLoadingInterval({
        type: 'profile',
        time: wave.getCrossloadTime(track.getSource())
      });

      function onSuccess(response) {
        Meteor.clearInterval(loadingInterval);
        wave.onUploadFinish();
        cb && cb(response.response.track.id);
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
