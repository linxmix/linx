Songs = new Meteor.Collection('Songs');
SongModel = Model(Songs);

SongModel.extend({
  getS3Url: function() {
    var part = 'http://s3-us-west-2.amazonaws.com/linx-music/';
    // TODO: make this work for non-mp3
    return part + 'songs/' + this._id + '.mp3';
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
