/** @jsx React.DOM */
var React = require('react');
var ReactBackboneMixin = require('backbone-react-component').mixin;

var Me = require('../models/Me');

var ConnectDisconnect = require('./ConnectDisconnect');

module.exports = React.createClass({
  
  mixins: [ReactBackboneMixin],

  getDefaultProps: function () {
    return {
      model: {
        me: new Me(),
      },
    };
  },

  render: function () {

    var greeting = "";
    if (this.props.me.id) {
      greeting = "Hello " + this.props.me.username + "!";
    }

    return (
      <div>
        {greeting}
        <ConnectDisconnect me={this.props.me} />
      </div>
    );
  },
});