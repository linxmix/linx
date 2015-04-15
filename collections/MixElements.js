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
    this.set('trackId', track.get('_id'));
    this.save();
  },

  saveLink: function(link) {
    this.set('linkId', link.get('_id'));
    this.save();
  },

  getWave: function() {
    var wave = this.wave();
    if (wave) { return wave; }

    wave = Waves.create();
    this.set('waveId', wave.get('_id'));
    this.save();
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
