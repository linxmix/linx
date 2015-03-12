TrackModel = _.extend({

  isLocal: function() {
    return (typeof this._local === 'boolean') && this._local;
  },

  setEchonest: function(attrs) {
    // TODO
    throw "Error: TrackModel.setEchonest unimplemented";
    this.save();
  },

  setSoundcloud: function(attrs) {
    console.log("set soundcloud", attrs);
    this.soundcloud = attrs;
    this.title = attrs.title;
    this.artist = attrs.user && attrs.user.username;
    this.save();
  },

  loadMp3Tags: function(file) {
    id3(file, function(err, tags) {
      console.log("load tags", tags, file.name);
      // fallback to filename on tag parse error
      if (err) {
        console.error(err);
        this.title = file.name;
      } else {
        this.title = tags.title;
        this.artist = tags.artist;
        this.album = tags.album;
      }
      console.log("save", this);
      this.save();
    }.bind(this));
  },

  getSoundcloudUrl: function() {
    var soundcloud = this.soundcloud;
    if (soundcloud && soundcloud.stream_url) {
      var clientId = Config.clientId_Soundcloud;
      return soundcloud.stream_url + '?client_id=' + clientId;
    } else {
      throw 'Could not get SoundcloudUrl for Song';
    }
  },

  getS3Url: function() {
    var part = 'http://s3-us-west-2.amazonaws.com/linx-music';
    // TODO: make this work for non-mp3
    // TODO: make work for songs / transitions
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
    throw 'getLinxType undefined';
  },

}, LinxModel);
