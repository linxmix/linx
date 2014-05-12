var Backbone = require('backbone');
var debug = require('debug')('models:Links')

var Links = require('../collections/Links');
var Link = require('./Link');

module.exports = Backbone.Model.extend({
  
  defaults: function () {
    return {
      'queue': new Links(),
      'upNext': new Links(),
    }
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

  setNodes: function (nodes) {
    this.set({ 'nodes': nodes });
  },

  setQueue: function (tracks) {
    this.set({
      'queue': Links.makeFromTracks(tracks),
    });
  },

  setUpNext: function (tracks) {
    this.set({
      'upNext': Links.makeFromTracks(tracks),
    });
  },

  getLinks: function () {
    var queue = this.get('queue').toJSON();
    var upNext = this.get('upNext').toJSON();
    return queue.concat(upNext);
  },

  // TODO
  setActive: function (track) {
    if (track) {
      throw new Error("Links.setActive unimplemented!");
    }
  },

  // TODO
  setPlaying: function (track) {
    if (track) {
      throw new Error("Links.setPlaying unimplemented!");
    }
  },

});