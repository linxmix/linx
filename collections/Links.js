LinkModel = Graviton.Model.extend({
  belongsTo: {
    user: {
      collectionName: 'users',
      field: 'createdBy'
    },
    fromTrack: {
      collectionName: 'tracks',
      field: 'fromTrackId',
    },
    toTrack: {
      collectionName: 'tracks',
      field: 'toTrackId',
    },
  },
  hasMany: {
    mixelements: {
      collectionName: 'mixelements',
      foreignKey: 'linkId',
    }
  },
  defaults: {
    flags: [],
    playCount: 0,
    fromTime: 0, // end time of fromTrack
    fromVol: 1, // volume of fromTrack
    toTime: 0, // start time of toTrack
    toVol:  1, // volume of toTrack
  }
}, {

  getTime: function(trackId) {
    if (trackId === this.get('fromTrackId')) {
      return this.get('endFrom');
    } else if (trackId === this.get('toTrackId')) {
      return this.get('startTo');
    } else {
      throw Error("Error: could not get start for Link with track: " + trackId);
    }
  },

});

Links = Graviton.define("links", {
  modelCls: LinkModel,
  timestamps: true,
});

// TODO: either fill these out or move them into Meteor.methods
Links.allow({
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
