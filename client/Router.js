var Backbone = require('backbone');
var React = require('react');

var App = require('./views/App');

module.exports = Backbone.Router.extend({
  routes: {
    "*path": "default",
  },
  default: function () {
    var app = new App();
    React.renderComponent(app, document.body);
  },
});