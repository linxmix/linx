var Backbone = require('backbone');

module.exports = Backbone.Model.extend({
  defaults: function () {
    return {
      id: null,
    };
  },

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
})