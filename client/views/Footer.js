/** @jsx React.DOM */
var React = require('react');
var ReactBackboneMixin = require('backbone-react-component').mixin;

var SoundBar = require('./SoundBar');

module.exports = React.createClass({
  
  mixins: [ReactBackboneMixin],

  render: function () {
    return (
      <footer>
        {SoundBar(this.props)}
      </footer>
    );
  },
});