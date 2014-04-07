/** @jsx React.DOM */
var React = require('react');
var ReactBackboneMixin = require('backbone-react-component').mixin;

var Playlist_Table = require('./Playlist_Table');

// TODO: turn this into a semantic table

module.exports = React.createClass({
  
  mixins: [ReactBackboneMixin],

  render: function () {

    // make a Playlist_Table for every playlist
    var playlists = this.props.playlists.map(function (playlist) {
      return Playlist_Table({
        'active': (playlist.cid === this.props.activePlaylist),
        'playlist': playlist,
        'handleClick': this.props.handleClick,
      });
    }.bind(this));

    return (
      <table className="ui table segment">
        <thead>
          <tr>
          <th>Playlist Name</th>
          </tr></thead>
        <tbody>
          {playlists}
        </tbody>
      </table>
    );
  },

});