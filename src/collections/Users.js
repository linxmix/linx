var Backbone = require('backbone');

var User = require('../models/User');

module.exports = Backbone.Collection.extend({
  url: "https://api.soundcloud.com/users",
  model: User,
});