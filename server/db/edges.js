var levelgraph = require('levelgraph');

var db = require('./');

module.exports = levelgraph(db.sublevel('edges'));