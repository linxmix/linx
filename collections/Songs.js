Songs = new Meteor.Collection('Songs');
SongModel = Model(Songs);

SongModel.extend({
  defaultValues: {},

  setSoundcloud: function(options) {
    console.log("set soundcloud", options);
    this.soundcloud = options;
    this.title = options.title;
    this.artist = options.user && options.user.username;
  },

  getSoundcloudUrl: function() {
    var soundcloud = this.soundcloud;
    if (soundcloud && soundcloud.stream_url) {
      var clientId = Utils.clientId_Soundcloud;
      return soundcloud.stream_url + '?client_id=' + clientId;
    } else {
      throw 'Could not get SoundcloudUrl for Song';
    }
  },

  getS3Url: function() {
    var part = 'http://s3-us-west-2.amazonaws.com/linx-music';
    // TODO: make this work for non-mp3
    return part + '/songs/' + this._id + '.mp3';
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
    if (this.soundcloud) {
      return 'soundcloud';
    } else {
      return 's3';
    }
  },

  getLinxType: function() {
    return 'song';
  },

  getTransitionsIn: function(endTime) {
    // TODO
  },

  // TODO: augment for startTime
  getTransitionsOut: function(startTime) {
    return Transitions.find({inId: this._id}).fetch();
  },

  getSongsIn: function() {
    // TODO
  },

  // TODO: augment for startTime
  getSongsOut: function(startTime) {
    return this.getTransitionsOut(startTime).reduce(function(songs, transition) {
      songs.push(Songs.findOne(transition.outId));
      return songs;
    }, []);
  }
});

Songs.allow({
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
