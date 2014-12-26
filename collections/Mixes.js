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

  add: function(trackId, index) {
    if (!_.isNumber(index)) {
      this.tracks.push(trackId);
    } else {
      this.tracks.splice(index, 0, trackId);
    }
    this.update({tracks: this.tracks, length: this.tracks.length});
  },

  replaceAt: function(trackId, index) {
    this.tracks[index] = trackId;
    this.update({tracks: this.tracks});
  },

  removeAt: function(index) {
    this.tracks.splice(index, 1);
    this.update({tracks: this.tracks, length: this.tracks.length});
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
