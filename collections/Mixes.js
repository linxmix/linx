MixModel = Graviton.Model.extend({
  belongsTo: {
    user: {
      collectionName: 'users',
      field: 'createdBy'
    },
  },
  belongsToMany: {
    tracks: {
      collectionName: 'tracks',
      field: 'trackIds',
    },
    links: {
      collectionName: 'links',
      field: 'linkIds',
    }
  },
  defaults: {
    playCount: 0,
  }
}, {

  // TODO: convert these to graviton
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
  // /TODO

});

Mixes = Graviton.define("mixes", {
  modelCls: MixModel,
  timestamps: true,
});

// TODO: either fill these out or move them into Meteor.methods
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
