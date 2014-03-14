var Backbone = require('backbone');
var React = require('react');
var $ = Backbone.$ = require('jquery');

var Router = require('./Router');

SC.initialize({
  client_id: "977ed530a2104a95eaa87f26fa710941",
  redirect_uri: "http://localhost:5000/callback.html",
});

$(function () {
  new Router();
  Backbone.history.start();
});