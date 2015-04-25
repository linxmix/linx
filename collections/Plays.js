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

// TODO
Plays.allow({
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
