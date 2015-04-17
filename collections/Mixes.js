MixModel = Graviton.Model.extend({
  belongsTo: {
    user: {
      collectionName: 'users',
      field: 'createdBy'
    },
  },
  defaults: {
    playCount: 0,
    title: 'New Mix',
    artist: 'No Artist',
    elementIds: [],
  }
}, {
  insertElementAt: function(index) {
    if (!(_.isNumber(index) && index > -1)) { console.log("invalid index", index); return; }
    var elementIds = this.get('elementIds');
    var element = MixElements.create();
    elementIds.splice(index, 0, element.get('_id'));
    this.saveAttrs('elementIds', elementIds);
    return element;
  },

  removeElementAt: function(index) {
    if (!(_.isNumber(index) && index > -1)) { console.log("invalid index", index); return; }
    var element = this.getElementAt(index);
    var elementIds = this.get('elementIds');
    elementIds.splice(index, 1);
    element.remove();
    this.saveAttrs('elementIds', elementIds);
  },

  getElements: function() {
    return this.get('elementIds').map(function(_id) {
      return MixElements.findOne(_id);
    });
  },

  getElementAt: function(index) {
    return this.getElements()[index];
  },

  getTrackAt: function(index) {
    if (!(_.isNumber(index) && index > -1)) { console.log("invalid index", index); return; }
    var element = this.getElementAt(index);
    return element && element.track();
  },

  getLinkAt: function(index) {
    if (!(_.isNumber(index) && index > -1)) { console.log("invalid index", index); return; }
    var element = this.getElementAt(index);
    return element && element.link();
  },

  getLength: function() {
    return this.getTracks().length;
  },

  getTracks: function() {
    var tracks = this.getElements().map(function(element) {
      return Tracks.findOne(element.get('trackId'));
    });
    // console.log("get tracks", tracks, this.get('_id'));
    return _.without(tracks, undefined);
  },

  getLinks: function() {
    return this.getElements().map(function(element) {
      return element.link();
    });
  },

  insertTrackAt: function(track, index) {
    if (!(_.isNumber(index) && index > -1)) { console.log("invalid index", index); return; }
    console.log("insert track at", track, index);
    this.insertElementAt(index).saveTrack(track);
  },

  insertLinkAt: function(link, index) {
    if (!(_.isNumber(index) && index > -1)) { console.log("invalid index", index); return; }
    console.log("insert link at", link, index);
    this.getElementAt(index).saveLink(link);
  },

  removeTrackAt: function(index) {
    // TODO: remove linkTo too?
    this.removeElementAt(index);
  },

  removeLinkAt: function(index) {
    if (!(_.isNumber(index) && index > -1)) { console.log("invalid index", index); return; }
    var track = this.getTrackAt(index);
    this.removeElementAt(index);
    this.insertTrackAt(track, index);
  },

  getWaveAt: function(index) {
    if (!(_.isNumber(index) && index > -1)) { console.log("invalid index", index); return; }
    var element = this.getElementAt(index);
    return element && element.getWave();
  },

  getLinkData: function(index) {
    console.log("get link data", {
      mix: this,
      fromWave: this.getWaveAt(index),
      fromTrack: this.getTrackAt(index),
      selectedLink: this.getLinkAt(index),
      toWave: this.getWaveAt(index + 1),
      toTrack: this.getTrackAt(index + 1),
    });
    return {
      mix: this,
      fromWave: this.getWaveAt(index),
      fromTrack: this.getTrackAt(index),
      selectedLink: this.getLinkAt(index),
      toWave: this.getWaveAt(index + 1),
      toTrack: this.getTrackAt(index + 1),
    };
  },

  getWaves: function() {
    var waves = [];
    this.getElements().reduce(function(prevWave, element) {
      var wave = element.getWave();
      var link = element.link();

      // setup double linkage
      if (prevWave) {
        wave.saveAttrs('prevWaveId', prevWave.get('_id'));
        prevWave.saveAttrs('nextWaveId', wave.get('_id'));
      }

      if (link) {
        wave.saveAttrs('linkFromId', link.get('_id'));
      }

      waves.push(wave);
      return wave;
    });
    return waves;
  }
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
