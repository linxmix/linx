var path = require('path');

var express = require('express');
var static = require('ecstatic');
var less = require('less-middleware');
var browserify = require('browserify-middleware');

var app = express();

// setup browserify
app.use('/js/index.js', browserify(__dirname + '/client.js', {
  transform: ['brfs'],
}));

// setup less w/ bootstrap
var bootstrapPath = path.join(__dirname, '/../', 'node_modules', 'bootstrap');
app.use('/img', static(path.join(bootstrapPath, 'img')));
app.use(less({
  src: path.join(__dirname, 'less'),
  paths: [
    path.join(__dirname, 'less'),
    path.join(bootstrapPath, 'less')
  ],
  dest: path.join(__dirname, '/../', 'static', 'css'),
  prefix: '/css',
  relativeUrls: true,
  compress: true
}));

app.use(static(__dirname + '/../static'));

var server = app.listen(5000);