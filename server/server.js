var feathers = require('feathers');
var ecstatic = require('ecstatic');

var isProd = (process.env.NODE_ENV === 'production');

module.exports = feathers()
  .configure(feathers.socketio())
  .use(ecstatic({
    root: __dirname + '/../static',
    cache: (isProd ? 3600 : 0),
  }));