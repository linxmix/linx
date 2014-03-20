/** @jsx React.DOM */
var React = require('react');
var ReactBackboneMixin = require('backbone-react-component').mixin;

module.exports = React.createClass({
  
  mixins: [ReactBackboneMixin],

  // add track to head of queue and play
  play: function(e) {
    var queue = this.getCollection().queue;
    queue.unshift(this.props.track);
    this.props.changePlayState('play');
  },

  // queue this track by adding to back of queue
  queue: function(e) {
    var queue = this.getCollection().queue;
    queue.push(this.props.track);
  },

  // remove track from queue
  dequeue: function(e) {
    var queue = this.getCollection().queue;
    var index = queue.models.indexOf(this.props.track);
    queue.remove(this.props.track);
  },

  render: function () {
    var track = this.props.track;

    return (
      <div>
        <div className="ui label">{track.title}</div>
        <div className="ui small button" onClick={this.play}>Play</div>
        <div className="ui small button" onClick={this.queue}>Queue</div>
        <div className="ui small button" onClick={this.dequeue}>Dequeue</div>
      </div>
    );
  },

});