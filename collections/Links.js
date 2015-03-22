LinkModel = Graviton.Model.extend({
  belongsTo: {
    user: {
      collectionName: 'users',
      field: 'createdBy'
    },
    trackFrom: {
      collectionName: 'tracks',
      field: 'fromTrackId',
    },
    trackTo: {
      collectionName: 'tracks',
      field: 'toTrackId',
    },
  },
  hasMany: {
    mixes: {
      collectionName: 'mixes',
      foreignKey: 'linkIds',
    }
  },
  defaults: {
    endFrom: 0, // end time of fromTrack
    startTo: 0, // start time of toTrack
  }
}, {

  getTime: function(trackId) {
    if (trackId === this.get('fromTrackId')) {
      return this.get('endFrom');
    } else if (trackId === this.get('toTrackId')) {
      return this.get('startTo');
    } else {
      throw Error("Error: could not get start for MixPoint with track: " + trackId);
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
