var Backbone = require('backbone');
var debug = require('debug')('collections:Mixes')

var Mix = require('../models/Mix');
var Playlists = require('./Playlists');

module.exports = Playlists.extend({

  model: Mix,
});