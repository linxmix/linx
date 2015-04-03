TrackModel = Graviton.Model.extend({
  belongsTo: {
    user: {
      collectionName: 'users',
      field: 'createdBy'
    },
  },
  hasMany: {
    mixes: {
      collectionName: 'mixes',
      foreignKey: 'trackIds',
    },
    toLinks: {
      collectionName: 'links',
      foreignKey: 'toTrackId',
    },
    fromLinks: {
      collectionName: 'links',
      foreignKey: 'fromTrackId',
    }
  },
  defaults: {
    flags: [],
    title: 'No Title',
    artist: 'No Artist',
    type: 'song', // one of 'song', 'transition' or 'mix'
    playCount: 0,
  },
}, {
  initWave: function(template) {
    if (this.get('wave')) {
      // TODO: will a track ever have more than one wave? what happens if so?
      throw new Error("Track already has a wave", this.get('title'));
    }

    // create wave, setup relationships
    var wave = Waves.create();
    this.set('wave', wave);
    wave.set('track', this);
    wave.init(template);
  },

  destroy: function() {
    this.destroyWave();
  },

  destroyWave: function() {
    this.get('wave').destroy();
    this.set('wave', undefined);
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
    this.get('wave').loadFiles(files);
    this.loadMp3Tags(file);
  },

  getAllLinks: function() {
    return this.toLinks.all().concat(this.fromLinks.all());
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
    console.log("getS3Url", this.get('_id'));
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
    var wave = this.get('wave');
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
    var wave = this.get('wave');

    // track progress
    Tracker.autorun(function(computation) {
      var uploads = S3.collection.find().fetch();
      var upload = uploads[0];
      if (upload) {
        var percent = upload.percent_uploaded;
        wave.onLoading({
          type: 'upload',
          percent: percent
        });
        if (percent === 100) {
          computation.stop();
        }
      }
      // TODO: figure out what this did
      // add to wave computations if doesn't already exist
      // wave.addLoadingComputation(computation);
    });

    S3.upload({
      files: wave.get('files'),
      path: track.getS3Prefix(),
    }, function(error, result) {
      if (error) { throw error; }
      // update track with new s3FileName
      var urlParts = result.relative_url.split('/');
      var s3FileName = urlParts[urlParts.length - 1];
      track.set({ s3FileName: s3FileName });
      cb && cb(error, result);
    });
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
