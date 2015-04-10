MixModel = Graviton.Model.extend({
  belongsTo: {
    user: {
      collectionName: 'users',
      field: 'createdBy'
    },
  },
  hasMany: {
    elements: {
      collectionName: 'mixelements',
      foreignKey: 'mixId',
    },
  },
  defaults: {
    playCount: 0,
    title: 'New Mix',
    isLocal: false,
    elementIds: [],
  }
}, {
  getElementAt: function(index) {
    var existing = this.elements.find({ index: index });
    if (existing) {
      return existing;
    } else {
      return this.elements.add({ index: index });
    }
  },

  getTrackAt: function(index) {
    var element = this.getElementAt(index);
    return element && element.track();
  },

  getLinkAt: function(index) {
    var element = this.getElementAt(index);
    return element && element.link();
  },

  getTracks: function() {
    var elements = this.getElements();
    return (elements || []).map(function(element) {
      return element.track();
    }) ;
  },

  getLinks: function() {
    var elements = this.getElements();
    return (elements || []).map(function(element) {
      return element.link();
    }) ;
  },

  addTrackAt: function(trackId, index) {
    var element = getElementAt(index);
    if (element && element.get('trackId') === trackId) {
      var trackIds = this.get('trackIds');
      trackIds.splice(index, 0, trackId);
      return this.set({
        trackIds: trackIds,
      });
    } else {

    }
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

  appendTrack: function(trackId) {
    return this.addTrackAt(trackId, this.get('trackIds').length);
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
