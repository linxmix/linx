require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"nbEHjA":[function(require,module,exports){
var global=typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {};(function browserifyShim(module, exports, define, browserify_shim__define__module__export__) {
this["JST"] = this["JST"] || {};

this["JST"]["index"] = function(obj) {obj || (obj = {});var __t, __p = '', __e = _.escape;with (obj) {__p += '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <link rel="stylesheet" href="css/index.css">\n</head>\n<body>\n\n  <header id="header"></header>\n  <section id="player"></section>\n  <section id="library"></section>\n  <footer id="footer"></footer>\n\n  <div id="emptyWaves"></div>\n\n  <script src="js/vendor.js"></script>\n  <script src="js/templates.js"></script>\n  <script src="js/app.js"></script>\n\n</body>\n</html>';}return __p};

this["JST"]["library/Library"] = function(obj) {obj || (obj = {});var __t, __p = '', __e = _.escape;with (obj) {__p += '<div class="samples"></div>';}return __p};

this["JST"]["library/samples/Sample"] = function(obj) {obj || (obj = {});var __t, __p = '', __e = _.escape;with (obj) {__p += '<div class="view">\n  <label>' +((__t = ( name )) == null ? '' : __t) +'</label>\n  <button class="destroy">x</button>\n  <button class="queue">+</button>\n</div>\n<input class="edit" value="' +((__t = ( name )) == null ? '' : __t) +'">';}return __p};

this["JST"]["library/samples/SampleList"] = function(obj) {obj || (obj = {});var __t, __p = '', __e = _.escape;with (obj) {__p += '<div class="sampleDrop"></div>\n<ul class="sampleList"></ul>\n';}return __p};

this["JST"]["players/Player"] = function(obj) {obj || (obj = {});var __t, __p = '', __e = _.escape;with (obj) {__p += '<ul class="tracks"></ul>';}return __p};

this["JST"]["players/SimplePlayer"] = function(obj) {obj || (obj = {});var __t, __p = '', __e = _.escape;with (obj) {__p += '<button class="playPause">play/pause</button>\n<button class="stop">stop</button>\n<button class="destroyTracks">destroy tracks</button>\n<div class="tracks"></div>\n';}return __p};

this["JST"]["players/clips/Clip"] = function(obj) {obj || (obj = {});var __t, __p = '', __e = _.escape;with (obj) {__p += '<div class="source"></div>';}return __p};

this["JST"]["players/clips/ClipList"] = function(obj) {obj || (obj = {});var __t, __p = '', __e = _.escape;with (obj) {__p += '<ul class="clipList"></ul>';}return __p};

this["JST"]["players/tracks/AdvancedTrack"] = function(obj) {obj || (obj = {});var __t, __p = '', __e = _.escape;with (obj) {__p += '<label id="name">' +((__t = ( name )) == null ? '' : __t) +'</label>\n<button class="destroy">x</button>\n<input class="edit" value="' +((__t = ( name )) == null ? '' : __t) +'">\n<ul class="trackClips"></ul>';}return __p};

this["JST"]["players/tracks/SimpleTrack"] = function(obj) {obj || (obj = {});var __t, __p = '', __e = _.escape;with (obj) {__p += '<button class="destroy">x</button>\n<div class="trackClips"></div>';}return __p};

this["JST"]["players/tracks/Track"] = function(obj) {obj || (obj = {});var __t, __p = '', __e = _.escape;with (obj) {__p += '<button class="destroy">x</button>\n<div class="trackClips"></div>';}return __p};

this["JST"]["players/tracks/TrackList"] = function(obj) {obj || (obj = {});var __t, __p = '', __e = _.escape;with (obj) {__p += '<ul class="trackList"></ul>';}return __p};
; browserify_shim__define__module__export__(typeof JST != "undefined" ? JST : window.JST);

}).call(global, undefined, undefined, undefined, function defineExport(ex) { module.exports = ex; });

},{}],"templates":[function(require,module,exports){
module.exports=require('nbEHjA');
},{}]},{},["nbEHjA"])
;