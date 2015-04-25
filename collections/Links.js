/* global Links: true */
/* global LinkModel: true */

LinkModel = Graviton.Model.extend({
  belongsTo: {
    user: {
      collectionName: 'users',
      field: 'userId'
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
    },
    plays: {
      collectionName: 'plays',
      foreignKey: 'linkId',
    }
  },
  defaults: {
    flags: [],
    fromTime: 0, // end time of fromTrack
    fromVol: 1, // volume of fromTrack
    toTime: 0, // start time of toTrack
    toVol: 1, // volume of toTrack
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

Links.allow({
  insert: Utils.isCreatingOwnDocument,
  update: Utils.ownsDocument,
  remove: Utils.ownsDocument
});
