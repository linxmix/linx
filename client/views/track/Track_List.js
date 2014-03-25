/** @jsx React.DOM */
var React = require('react');
var ReactBackboneMixin = require('backbone-react-component').mixin;
var debug = require('debug')('views:track/Track_List');

module.exports = React.createClass({
  
  mixins: [ReactBackboneMixin],

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

  render: function () {
    var track = this.props.track;

    return (
      <div>
        <div className="ui label">{track.get('title')}</div>
        <div className="ui small button" onClick={this.play}>Play</div>
        <div className="ui small button" onClick={this.queue}>Queue</div>
        <div className="ui small button" onClick={this.dequeue}>Dequeue</div>
      </div>
    );
  },

});