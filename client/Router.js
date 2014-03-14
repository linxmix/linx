var Backbone = require('backbone');
var React = require('react');

module.exports = Backbone.Router.extend({
  routes: {
    "actions": "all",
  },
  all: function () {
    console.log("wwoooo!");
  },
});