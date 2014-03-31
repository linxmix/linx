/** @jsx React.DOM */
var React = require('react');
var ReactBackboneMixin = require('backbone-react-component').mixin;

var Tracks_Wave = require('../track/Tracks_Wave');

module.exports = React.createClass({
  
  mixins: [ReactBackboneMixin],

  // TODO: display user profile soundcloud widget
  render: function () {

    // if the user is logged in, say hello!
    var greeting = "Not logged in.";
    if (this.props.me.id) {
      greeting = "Hello " + this.props.me.username + "!";
    }

    return (
      <div>
        {greeting}
        {Tracks_Wave({
          'tracks': this.getCollection().myTracks,
          'changePlayState': this.props.changePlayState,
        })}
      </div>
    );
  },
});