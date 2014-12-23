Mixes = new Meteor.Collection('Mixes');
MixModel = Model(Mixes);

MixModel.extend({
  defaultValues: {
    tracks: [],
    length: 0,
  },

  getSongs: function() {
    var tracks = this.tracks;
    return tracks.reduce(function(acc, trackId) {
      var song = Songs.findOne(trackId);
      song && acc.push(song);
      return acc;
    }, []);
  },

  addTrack: function(trackId, index) {
    var tracks = this.tracks;
    if (!_.isNumber(index)) {
      tracks.push(trackId);
    } else {
      tracks.splice(index, 0, trackId);
    }
    this.update({tracks: tracks, length: tracks.length});
  }
});

Mixes.allow({
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
