/** @jsx React.DOM */
var React = require('react');
var ReactBackboneMixin = require('backbone-react-component').mixin;

var NavBar = require('./bars/nav/NavBar');

module.exports = React.createClass({
  
  mixins: [ReactBackboneMixin],

  render: function () {
    return (
      <header>
        {NavBar(this.props)}
      </header>
    );
  },
});