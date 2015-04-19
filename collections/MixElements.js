MixElementModel = Graviton.Model.extend({
  belongsTo: {
    user: {
      collectionName: 'users',
      field: 'createdBy'
    },
    track: {
      collectionName: 'tracks',
      field: 'trackId',
    },
    wave: {
      collectionName: 'waves',
      field: 'waveId',
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
  saveTrack: function(track) {
    this.saveAttrs('trackId', track.get('_id'));
  },

  saveLink: function(link) {
    this.saveAttrs('linkId', link.get('_id'));
  },

  getWave: function() {
    var wave = Waves.findOne(this.get('waveId'));
    if (!wave) {
      wave = Waves.create();
      this.saveAttrs('waveId', wave.get('_id'));
    }
    return wave;
  }
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
