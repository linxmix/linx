var express = require('express');
var static = require('ecstatic');
var app = express();

app.use(static(__dirname + '/../static'));

module.exports = app;