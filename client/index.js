var Backbone = require('backbone');
var React = require('react');
var $ = Backbone.$ = require('jquery');

var config = require('./config');
var Router = require('./Router');

SC.initialize({
  client_id: config.clientId,
  redirect_uri: config.redirectUri,
});

$(function () {
  new Router();
  Backbone.history.start();
});