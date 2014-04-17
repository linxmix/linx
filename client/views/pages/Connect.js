/** @jsx React.DOM */
var React = require('react');
var ReactBackboneMixin = require('backbone-react-component').mixin;

module.exports = React.createClass({
  
  mixins: [ReactBackboneMixin],

  getDefaultProps: function () {
    return {
      'showDisconnect': true,
    }
  },

  render: function () {
    var me = this.getModel().me;
    if (!me.id) {
      return <img className="clickable" src="http://connect.soundcloud.com/2/btn-connect-sc-l.png" onClick={this.login} />
    } else if (this.props.showDisconnect) {
      return <img className="clickable" src="http://connect.soundcloud.com/2/btn-disconnect-l.png" onClick={this.logout} />
    }
  },

  login: function () {
    var onLogin = this.props.onLogin;
    var colls = this.getCollection();
    console.log("LOGGING IN", colls);
    this.getModel().me.login(colls.myTracks, colls.playlists, onLogin);
  },

  logout: function () {
    this.getModel().me.logout();
  },
});