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
    title: 'New Mix',
    isLocal: false,
  }
}, {

  appendTrack: function(trackId) {
    return this.addTrackAt(trackId, this.get('trackIds').length);
  },

  addTrackAt: function(trackId, index) {
    var trackIds = this.get('trackIds');
    trackIds.splice(index, 0, trackId);
    return this.set({
      trackIds: trackIds,
    });
  },

  replaceTrackAt: function(trackId, index) {
    var trackIds = this.get('trackIds');
    trackIds.splice(index, 1, trackId);
    return this.set({
      trackIds: trackIds,
    });
  },

  removeTrackAt: function(index) {
    var trackIds = this.get('trackIds');
    trackIds.splice(index, 1);
    return this.set({
      trackIds: trackIds
    });
  },

  removeTrack: function(trackId) {
    return this.removeTrackAt(trackId, this.get('trackIds').indexOf(trackId));
  },

  // TODO: convert these to graviton
  getSongs: function() {
    var tracks = this.tracks;
    return tracks.reduce(function(acc, trackId) {
      var song = Songs.findOne(trackId);
      song && acc.push(song);
      return acc;
    }, []);
  },

  // /TODO

});

Mixes = Utils.defineCollection("mixes", {
  modelCls: MixModel,
  timestamps: true,
});

// TODO
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
