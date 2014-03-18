var feathers = require('feathers');
var ecstatic = require('ecstatic');

var isProd = (process.env.NODE_ENV === 'production');

var db = require(db);

var app = feathers()
  .configure(feathers.socketio())
  .use(ecstatic({
    root: __dirname + '/../static',
    cache: (isProd ? 3600 : 0),
  }));
  .service('/edges', require('./services/edges')(db));

module.exports = app;