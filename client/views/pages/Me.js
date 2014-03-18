/** @jsx React.DOM */
var React = require('react');
var ReactBackboneMixin = require('backbone-react-component').mixin;

var Wave = require('../Wave');

module.exports = React.createClass({
  
  mixins: [ReactBackboneMixin],

  render: function () {

    // if the user is logged in, say hello!
    var greeting = "Not logged in.";
    if (this.props.me.id) {
      greeting = "Hello " + this.props.me.username + "!";
    }

    // make a Wave for every Track
    var waves = this.props.tracks.map(function (track) {
      return <Wave track={track} />
    });

    return (
      <div>
        {greeting}
        {waves}
      </div>
    );
  },
});