var Backbone = require('backbone');
var React = require('react');

var App = require('./views/App');
var app = new App();

module.exports = Backbone.Router.extend({
  routes: {
    "*path": "default",
  },
  default: function () {
    React.renderComponent(app, document.body);
  },
});