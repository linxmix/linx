var levelgraph = require('levelgraph');

var db = require('./db');

module.exports = levelgraph(db);