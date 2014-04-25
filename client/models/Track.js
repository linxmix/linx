var Backbone = require('backbone');

module.exports = Backbone.Model.extend({

  defaults: function () {
    return {
      'title': '',
      'playback_count': 0,
      'duration': 0,
      'linxType': 'song',
    }
  },

  getDefaultStart: function () {
    return 0;
  },

  getDefaultEnd: function () {
    return this.get('duration') / 1000;
  },

  constructor: function (attributes, options) {
    attributes = attributes ? attributes : {};
    options = options ? options : {};

    // MEGA TODO: if adding from id, check if is transition

    // MEGA TODO: make it so id is converted into string 'soundcloud__{id}'

    // TODO: convert all references from cid to id

    // MEGA TODO: make it so you can make this from
    //       a soundcloud id in attributes
    // TODO: find if already have a track model for that id?

    // continue regular constructor
    Backbone.Model.apply(this, arguments);
  },


});