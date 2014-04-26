/** @jsx React.DOM */
var React = require('react');
var ReactBackboneMixin = require('backbone-react-component').mixin;
var debug = require('debug')('views:pages/LinxMap')

var _ = require('underscore');

var Track_Wave = require('../track/Track_Wave');
var Transition = require('../../models/Transition');

module.exports = React.createClass({
  
  mixins: [ReactBackboneMixin],

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
        {tracks}
      </div>
    );
  },

});
