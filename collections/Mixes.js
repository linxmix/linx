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
    trackIds: [],
    linkIds: [],
  }
}, {

  appendTrack: function(trackId) {
    return this.addTrackAt(trackId, this.get('trackIds').length);
  },

  getTrackAt: function(index) {
    var trackIds = this.get('trackIds');
    return Tracks.findOne(trackIds[index]);
  },

  getTracks: function() {
    return this.get('trackIds').map(function(trackId) {
      return Tracks.findOne(trackId);
    });
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
    if (!(_.isNumber(index) && index > -1)) { return; }
    var trackIds = this.get('trackIds');
    trackIds.splice(index, 1);
    return this.set({
      trackIds: trackIds
    });
  },

  removeTrack: function(trackId) {
    return this.removeTrackAt(this.get('trackIds').indexOf(trackId));
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

Mixes = Graviton.define("mixes", {
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
