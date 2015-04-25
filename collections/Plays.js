/* global Plays: true */
/* global PlayModel: true */

PlayModel = Graviton.Model.extend({
  belongsTo: {
    user: {
      collectionName: 'users',
      field: 'userId'
    },
    track: {
      collectionName: 'tracks',
      field: 'trackId',
    },
    link: {
      collectionName: 'links',
      field: 'linkId',
    },
    mix: {
      collectionName: 'mixes',
      field: 'mixId',
    },
  }
}, {
  getModel: function() {
    return this.track() || this.link() || this.mix();
  }
});

Plays = Graviton.define("plays", {
  modelCls: PlayModel,
  timestamps: true,
});

Plays.allow({
  insert: Utils.isCreatingOwnDocument,
  update: Utils.ownsDocument,
  remove: Utils.ownsDocument
});
