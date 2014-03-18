var Backbone = require('backbone');
var React = require('react');

var App = require('./views/App');
var app = new App();

module.exports = Backbone.Router.extend({
  // TODO: add routes to specific tab pages
  //       => (init app with a page based on the url)
  routes: {
    "*path": "default",
  },
  default: function () {
    React.renderComponent(app, document.body);
  },
});