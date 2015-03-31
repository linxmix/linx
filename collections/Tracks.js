TrackModel = Graviton.Model.extend({
  belongsTo: {
    user: {
      collectionName: 'users',
      field: 'createdBy'
    },
  },
  hasMany: {
    waves: {
      collectionName: 'waves',
      foreignKey: 'trackId',
    },
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
    type: 'song', // one of 'song', 'transition' or 'mix'
    playCount: 0,
  }
}, {

  setEchonest: function(attrs) {
    console.log("set echonest", attrs);
    this.set({
      echonest: attrs,      
      title: attrs.title,
      artist: attrs.artist,
    });
    this.save();
  },

  setSoundcloud: function(attrs) {
    console.log("set soundcloud", attrs);
    this.set({
      soundcloud: attrs,
      title: attrs.title,
      artist: attrs.user && attrs.user.username,
    });
    this.save();
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
      this.save();
    }.bind(this));
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
  // /TODO

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

});

Tracks = Graviton.define("tracks", {
  modelCls: TrackModel,
  timestamps: true,
});

NewTracks = Graviton.define("newTracks", {
  modelCls: TrackModel,
  persist: false,
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
