var Backbone = require('backbone')

var User = require('./User');

module.exports = User.extend({

  url: "https://api.soundcloud.com/me",

  login: function () {
    SC.connect(function () {
      SC.get('/me', function (me) {
        this.set(me);
      }.bind(this));
    }.bind(this));
  },

  logout: function () {
    this.clear();
  },
});