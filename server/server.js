var express = require('express');
var ecstatic = require('ecstatic');

var isProd = (process.env.NODE_ENV === 'production');

var app = express();

app.configure(function () {
  app.use(require('morgan')());
  app.use(require('compression')());
  app.use(ecstatic({
    root: __dirname + '/../static',
    cache: (isProd ? 3600 : 0),
  }));
  app.use(require('body-parser')());
  app.use(app.router);
});

require('./routes/edges')(app);

module.exports = app;