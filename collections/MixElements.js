MixElementModel = Graviton.Model.extend({
  belongsTo: {
    user: {
      collectionName: 'users',
      field: 'createdBy'
    },
    track: {
      collectionName: 'track',
      field: 'trackId',
    },
    link: {
      collectionName: 'links',
      field: 'linkId',
    },
    mix: {
      collectionName: 'mixes',
      field: 'mixId',
    }
  },
  defaults: {
    index: undefined,
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
