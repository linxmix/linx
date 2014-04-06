var levelup = require("level");

var dbName = (process.env.NODE_ENV === 'test')
  ? 'testdb'
  : 'db';

module.exports = levelup(dbName);