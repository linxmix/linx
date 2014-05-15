var Backbone = require('backbone');
var debug = require('debug')('collections:Links')

var Link = require('../models/Link');

var Links = Backbone.Collection.extend({

  initialize: function (models, options) {
    this.on("add", function(link) {
      debug("added link: " + link.id);
    });
    this.options = options;
  },

  model: Link,
});

Links.makeFromTracks = function (tracks) {
  var links = tracks.map(function (track) {
    var props = {
      'linxType': 'transition',
      'transitionType': track.get('transitionType'),
      'track': track,
    };
    // weird to account for soft transitions having no id
    if (track.id) { props.id = track.id; }
    return props;
  });
  return new Links(links);
};

module.exports = Links;