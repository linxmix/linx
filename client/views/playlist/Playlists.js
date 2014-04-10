/** @jsx React.DOM */
var React = require('react');
var ReactBackboneMixin = require('backbone-react-component').mixin;

var Playlist_List = require('./Playlist_List');
var Playlist_Tab = require('./Playlist_Tab');

// TODO: turn this into a semantic table

module.exports = React.createClass({
  
  mixins: [ReactBackboneMixin],

  render: function () {

    // determine which view to use
    var Playlist;
    switch (this.props.playlistView) {
      case 'list': Playlist = Playlist_List; break;
      case 'tab': Playlist = Playlist_Tab; break;
      default: debug("WARNING: unknown playlistView", this.props.playlistView);
    }

    // make a Playlist for every playlist
    var playlists = this.props.playlists.map(function (playlist) {
      return Playlist({
        'active': (playlist.cid === this.props.viewingPlaylist.cid),
        'playing': (playlist.cid === this.props.playingPlaylist.cid),
        'playlist': playlist,
        'handleClick': this.props.handleClick,
      });
    }.bind(this));

    return (
      <div>
        {playlists}
      </div>
    );
  },

});