var Backbone = require('backbone');
var debug = require('debug')('models:Nodes')

var Nodes = require('../collections/Nodes');
var Node = require('./Node');

module.exports = Backbone.Model.extend({

  defaults: function () {
    return {
      'queue': new Nodes(),
      'upNext': new Nodes(),
      'active': {
        'node': null,
        'isNew': false,
      },
      'playing': null,
    }
  },

  // TODO: should this be cached?
  getNodes: function () {
    var queue = this.get('queue').toJSON();
    var upNext = this.get('upNext').toJSON();
    var nodes = queue.concat(upNext);
    // possibly add active
    var active = this.get('active');
    if (active.isNew) {
      nodes.push(active.node.toJSON());
    }
    return nodes;
  },

  getNodesMap: function () {
    var nodes = this.getNodes();
    var nodesMap = {};
    nodes.forEach(function (node) {
      nodesMap[node.id] = node;
    }.bind(this));
    // possibly change active
    debug("GETTING NODES MAP", this.get('active'))
    var active = this.get('active').node;
    if (active) {
      nodesMap[active.id] = active.toJSON();
    }
    return nodesMap;
  },

  // TODO: move this and updates into graph? seems
  //       pretty viewy but also makes sense here
  setDimensions: function (width, height) {
    this.set({
      'width': width,
      'height': height,
      'x0': width / 2.0,
      'y0': height / 2.0,
      'r': height / 2.5,
    });
  },

  setQueue: function (tracks) {
    debug("SETTING QUEUE", tracks)
    this.set({
      'queue': Nodes.makeFromTracks(tracks),
    });
    this.updateQueue();
  },

  setUpNext: function (tracks) {
    debug("SETTING UPNEXT", tracks)
    this.set({
      'upNext': Nodes.makeFromTracks(tracks),
    });
    this.updateUpNext();
  },

  setActive: function (track) {
    debug("SETTING ACTIVE", track)
    var active, isNew = false;
    // if given track, get or make active
    if (track) {
      var id = track.id;
      active = this.get('queue').get(id);
      if (!active) {
        active = this.get('upNext').get(id);
        if (!active) {
          active = new Node({
            'track': track,
            'id': track.id,
            'linxType': 'song',
          });
          isNew = true;
        }
      }
    }
    // update active and prevActive
    var prevActive = this.get('active').node;
    this.set({ 'active': {
      'node': active,
      'isNew': isNew,
    }});
    this.updateActive(prevActive, active)
  },

  setPlaying: function (track) {
    debug("SETTING PLAYING", track)
    var playing;
    // if given track, get playing
    if (track) {
      var id = track.id;
      playing = this.get('queue').get(id);
      if (!playing) {
        throw new Error("cannot Nodes.setPlaying with track not in Nodes.get('queue')");
      }
    }
    // update playing and prevPlaying
    var prevPlaying = this.get('playing');
    this.set({ 'playing': playing });
    this.updatePlaying(prevPlaying, playing)
  },

  updatePlaying: function (prevPlaying, playing) {
    // color playingTrack blue
    if (playing) {
      playing.set({
        'color': 2,
        'pColor': playing.get('color'),
      });
    }
    if (prevPlaying) {
      prevPlaying.set({
        'color': prevPlaying.get('pColor'),
      });
    }
  },

  updateActive: function (prevActive, active) {
    // update active
    if (active) {
      // place active track in center of screen
      active.set({
        'x': this.get('x0'),
        'px': active.get('x'),
        'y': this.get('y0'),
        'py': active.get('y'),
        'color': 2,
        'pColor': active.get('color'),
      });
    }
    // update prevActive
    if (prevActive) {
      prevActive.set({
        'x': prevActive.get('px'),
        'y': prevActive.get('py'),
        'color': prevActive.get('pColor'),
      });
    }
  },

  // place upNext songs in a circle
  updateUpNext: function () {
    var nodes = this.get('upNext');
    debug("updating upNext", nodes);
    var x0 = this.get('x0');
    var y0 = this.get('y0');
    var r = this.get('r');
    var length = nodes.length;
    for (var i = 0; i < length; i++) {
      var node = nodes.at(i);
      var theta = (i / length) * (2.0 * Math.PI);
      node.set({
        'x': x0 + r * Math.cos(theta),
        'y': y0 + r * Math.sin(theta),
        'color': 0,
      });
    }
  },

  // place and color queued songs
  updateQueue: function () {
    var nodes = this.get('queue');
    debug("updating queue", nodes);
    var width = this.get('width');
    for (var i = 0; i < nodes.length; i++) {
      var node = nodes.at(i);
      node.set({
        'x': 5,
        'y': 5 * i + 5,
        'color': 1,
      });
    }
  },

});