/** @jsx React.DOM */
var React = require('react');
var ReactBackboneMixin = require('backbone-react-component').mixin;
var debug = require('debug')('views:pages/LinxMap')

var _ = require('underscore');

var Track_Wave = require('../track/Track_Wave');
var Transition = require('../../models/Transition');

module.exports = React.createClass({
  
  mixins: [ReactBackboneMixin],

  // queue transition
  onClick: function (e) {
    var transitions = this.getCollection().transitions;
    debug("TODO: make this queue transition", transitions.models[0]);
  },

  render: function () {

    // make a Track_Wave for every Transition
    var tracks = this.getCollection().transitions.map(function (track) {
      return Track_Wave({
        'track': track,
        'changePlayState': this.props.changePlayState,
      });
    }.bind(this));

    return (
      <div>
        <div className="black ui button" onClick={this.onClick}>
          Queue Transition
        </div>
        {tracks}
      </div>
    );
  },

});
