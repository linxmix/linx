var levelup = require("level");
var sublevel = require("level-sublevel");
var levelWriteStream = require("level-writestream");

var dbName = (process.env.NODE_ENV === 'test')
  ? 'testdb'
  : 'db';

module.exports = sublevel(levelWriteStream(levelup(dbName)));