var express = require('express');
var ecstatic = require('ecstatic');

var isProd = (process.env.NODE_ENV === 'production');

var db = require('./db');

var app = express();

app.use(ecstatic({
  root: __dirname + '/../static',
  cache: (isProd ? 3600 : 0),
}));

require('./routes/edges')(app, db);

module.exports = app;