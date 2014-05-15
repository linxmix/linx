/** @jsx React.DOM */
var React = require('react');
var ReactBackboneMixin = require('backbone-react-component').mixin;
var debug = require('debug')('views:playlist/Playlist_List');

module.exports = React.createClass({
  
  mixins: [ReactBackboneMixin],

  render: function () {
    var playlist = this.props.playlist;

    return (
      <div className="ui segment">
        <div className="ui label">{playlist.get('name')}</div>
      </div>
    );
  },

});