MixElementModel = Graviton.Model.extend({
  belongsTo: {
    user: {
      collectionName: 'users',
      field: 'createdBy'
    },
  },
  hasOne: {
    track: {
      collectionName: 'tracks',
      foreignKey: 'trackId',
    },
    link: {
      collectionName: 'links',
      foreignKey: 'linkId',
    },
    mix: {
      collectionName: 'mixes',
      foreignKey: 'mixId',
    },
  }
}, {

});

MixElements = Graviton.define("mixelements", {
  modelCls: MixElementModel,
  timestamps: true,
});

// TODO
MixElements.allow({
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
