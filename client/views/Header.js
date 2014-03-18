/** @jsx React.DOM */
var React = require('react');
var ReactBackboneMixin = require('backbone-react-component').mixin;

var NavBar = require('./nav/NavBar');

module.exports = React.createClass({
  
  mixins: [ReactBackboneMixin],

  render: function () {

    // if the user is logged in, say hello!
    var greeting = "";
    if (this.props.me.id) {
      greeting = "Hello " + this.props.me.username + "!";
    }

    return (
      <header>
        {greeting}
        <NavBar me={this.props.me} />
      </header>
    );
  },
});