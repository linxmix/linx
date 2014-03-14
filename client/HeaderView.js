/** @jsx React.DOM */
var React = require('react');
var ReactBackboneMixin = require('backbone-react-component').mixin;

var User = require('./User');

module.exports = React.createClass({
  
  mixins: [ReactBackboneMixin],

  getDefaultProps: function () {
    return {
      model: {
        user: new User(),
      },
    };
  },

  render: function () {
    if (!this.props.user.id) {
      return <img src="http://connect.soundcloud.com/2/btn-connect-l.png" onClick={this.login} />
    } else {
      return <img src="http://connect.soundcloud.com/2/btn-disconnect-l.png" onClick={this.logout} />
    }
  },

  login: function () {
    console.log(this.getModel());
    this.getModel().user.login();
  },

  logout: function () {
    this.getModel().user.logout();
  },
});