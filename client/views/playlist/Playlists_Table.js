/** @jsx React.DOM */
var React = require('react');
var ReactBackboneMixin = require('backbone-react-component').mixin;

var Playlist_Table = require('./Playlist_Table');

module.exports = React.createClass({
  
  mixins: [ReactBackboneMixin],

  getDefaultProps: function () {
    return {
      'className': "ui table segment",
    }
  },

  render: function () {

    // make a Playlist_Table for every playlist
    console.log("PLAYING PLAYLIST", this.props.playingPlaylist);
    var playlists = this.props.playlists.map(function (playlist) {
      console.log("CHECKING PLAYLIST", playlist);
      return Playlist_Table({
        'active': (playlist.cid === this.props.viewingPlaylist.cid),
        'playing': (playlist.cid === this.props.playingPlaylist.cid),
        'playlist': playlist,
        'handleClick': this.props.handleClick,
      });
    }.bind(this));

    // TODO: determine headers via arguments
    return (
      <table className={this.props.className}>
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