require('./index.less');

if (process.env.NODE_ENV === "development") {
  require('debug').enable('*');
}

var Backbone = require('backbone');
var React = require('react');
var $ = Backbone.$ = require('jquery');

var config = require('./config');
var Router = require('./Router');

// why does this not work?
var echojs = require('echojs');

/*
var echo = echojs({
  key: config.echoId,
});

echo('song/search').get({
  artist: 'radiohead',
  title: 'karma police'
}, function (err, json) {
  console.log(json.response);
});
*/

SC.initialize({
  client_id: config.clientId,
  redirect_uri: config.redirectUri,
});

$(function () {
  new Router();
  Backbone.history.start();
});