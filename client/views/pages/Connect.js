/** @jsx React.DOM */
var React = require('react');
var ReactBackboneMixin = require('backbone-react-component').mixin;

module.exports = React.createClass({
  
  mixins: [ReactBackboneMixin],

  render: function () {
    if (!this.props.me.id) {
      return <img src="http://connect.soundcloud.com/2/btn-connect-l.png" onClick={this.login} />
    } else {
      return <img src="http://connect.soundcloud.com/2/btn-disconnect-l.png" onClick={this.logout} />
    }
  },

  login: function () {
    this.getModel().me.login(this.getCollection().myTracks);
  },

  logout: function () {
    this.getModel().me.logout();
  },
});