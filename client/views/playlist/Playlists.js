/** @jsx React.DOM */
var React = require('react');
var ReactBackboneMixin = require('backbone-react-component').mixin;

var Playlist_List = require('./Playlist_List');
var Playlist_Tab = require('./Playlist_Tab');

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
    var viewingPlaylist = this.props.viewingPlaylist;
    var playingPlaylist = this.props.playingPlaylist;
    var playlists = this.props.playlists.map(function (playlist) {
      // skip searchResults if has no tracks
      if ((playlist.get('type') === 'searchResults') &&
        (playlist.tracks().length === 0)) {
        return;
      } else {
        return Playlist({
          'active': (viewingPlaylist &&
            (playlist.cid === viewingPlaylist.cid)),
          'playState': this.props.playState,
          'isPlayingPlaylist': (playingPlaylist &&
            (playlist.cid === playingPlaylist.cid)),
          'dragging': this.props.dragging,
          'playlist': playlist,
          'handleClick': this.props.handleClick,
        });
      }
    }.bind(this));

    return (
      <div>
        {playlists}
      </div>
    );
  },

});