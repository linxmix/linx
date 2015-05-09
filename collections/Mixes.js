/* global Mixes: true */
/* global MixModel: true */

MixModel = Graviton.Model.extend({
  belongsTo: {
    user: {
      collectionName: 'users',
      field: 'userId'
    },
  },
  hasMany: {
    plays: {
      collectionName: 'plays',
      foreignKey: 'mixId',
    },
  },
  defaults: {
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

  getRouteData: function() {
    return {
      _id: this.get('_id')
    }
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
    return _.without(this.getElements().map(function(element) {
      return element.link();
    }), undefined);
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

  getTrackData: function(index) {
    return {
      mix: this,
      prevTrack: this.getTrackAt(index - 1),
      nextTrack: this.getTrackAt(index),
    };
  },

  getLinkData: function(index) {
    return {
      mix: this,
      fromWave: this.getWaveAt(index),
      fromTrack: this.getTrackAt(index),
      selectedLink: this.getLinkAt(index),
      toWave: this.getWaveAt(index + 1),
      toTrack: this.getTrackAt(index + 1),
    };
  },

  getElementData: function() {
    var data = [];
    var mix = this;

    this.getElements().reduce(function(prev, element, i) {
      var track = element.track();
      var wave = element.getWave();
      var link = element.link();

      wave.setTrack(track);

      var prevWave = prev.wave;
      var prevLink = prev.link;

      // setup double linkage
      if (prevWave) {
        wave.setPrevWave(prevWave);
        prevWave.setNextWave(wave);
      }
      if (prevLink) {
        wave.setLinkTo(prevLink);
      }
      if (link) {
        wave.setLinkFrom(link);
      }

      data.push({
        index: i,
        track: track,
        mix: mix,
        link: link,
        wave: wave,
      });

      return {
        wave: wave,
        link: link,
      };
    }, {});
    return data;
  }
});

Mixes = Graviton.define("mixes", {
  modelCls: MixModel,
  timestamps: true,
});

Mixes.allow({
  insert: Utils.isCreatingOwnDocument,
  update: Utils.ownsDocument,
  remove: Utils.ownsDocument
});
