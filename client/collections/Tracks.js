var Backbone = require('backbone');

module.exports = Backbone.Collection.extend({
  url: "https://api.soundcloud.com/tracks"
});