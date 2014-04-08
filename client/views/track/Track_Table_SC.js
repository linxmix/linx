/** @jsx React.DOM */
var React = require('react');
var ReactBackboneMixin = require('backbone-react-component').mixin;
var debug = require('debug')('views:track/Track_Table_SC');

var _ = require('underscore');

var Row = require('../bars/nav/Row');

module.exports = React.createClass({
  
  mixins: [ReactBackboneMixin],

  // TODO: right click menu on right click.
  handleClick: function(track, e) {
    this.props.handleClick(track, e);
  },

  render: function () {
    var track = this.props.track;
    return Row(_.extend({}, track, {
      'key': track.cid,
      'data': [track.get('title')],
      'active': this.props.active,
      'activeClass': 'positive',
      'inactiveClass': '',
      'draggable': true,
      'handleClick': this.props.handleClick,
      'handleDblClick': this.play,
    }));
  },

  // add track to head of queue and play
  play: function(e) {
    var track = this.props.track;
    debug("queueing and playing track", track);
    var queue = this.getCollection().queue;
    queue.unshift(track);
    this.props.changePlayState('play');
  },

  // queue this track by adding to back of queue
  queue: function(e) {
    var track = this.props.track;
    debug("queueing track", track);
    var queue = this.getCollection().queue;
    queue.push(track);
  },

  // remove track from queue
  dequeue: function(e) {
    var track = this.props.track;
    debug("dequeueing track", track);
    var queue = this.getCollection().queue;
    var index = queue.models.indexOf(track);
    queue.remove(track);
  },

  // TODO
  // view this track
  viewTrack: function () {
    var track = this.props.track;
    debug("viewing track", track);
  },

});