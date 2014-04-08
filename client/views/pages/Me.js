/** @jsx React.DOM */
var React = require('react');
var ReactBackboneMixin = require('backbone-react-component').mixin;

var Tracks_Table = require('../track/Tracks_Table');
var Connect = require('./Connect');

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
        <Connect me={this.props.me} />
        {greeting}
        {Tracks_Table({
          'tracks': this.getCollection().myTracks,
          'trackView': 'wave',
          'changePlayState': this.props.changePlayState,
        })}
      </div>
    );
  },
});