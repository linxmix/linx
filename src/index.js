require('./index.less');

if (process.env.NODE_ENV === "development") {
  require('debug').enable('*');
}

var Backbone = require('backbone');
var React = require('react');
var $ = Backbone.$ = jQuery = require('jquery');

var config = require('./config');
var Router = require('./Router');

try {
  SC.initialize({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
  });
} catch (e) {
  console.log("ERROR: SOUNDCLOUD SDK NOT LOADED", e);
  SC = {};
}

require('semantic/src/modules/dimmer');
require('semantic/src/modules/transition');
require('semantic/src/modules/popup');
require('semantic/src/modules/sidebar');
require('semantic/src/modules/dropdown');

$(function () {
  new Router();
  Backbone.history.start();
});