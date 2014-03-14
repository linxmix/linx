/** @jsx React.DOM */
var React = require('react');

module.exports = React.createClass({
  
  getInitialState: function () {
    return {
      userId: null,
    };
  },

  render: function () {
    if (!this.state.userId) {
      return <img src="http://connect.soundcloud.com/2/btn-connect-l.png" onClick={this.login} />
    } else {
      return <img src="http://connect.soundcloud.com/2/btn-disconnect-l.png" onClick={this.logout} />
    }
  },

  login: function () {
    SC.connect(function () {
      SC.get('/me', function (me) {
        this.setState({
          userId: me.id,
        });
      }.bind(this));
    }.bind(this));
  },

  logout: function () {
    this.setState({
      userId: null,
    });
  },
});