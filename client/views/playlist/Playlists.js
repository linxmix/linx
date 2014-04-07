/** @jsx React.DOM */
var React = require('react');
var ReactBackboneMixin = require('backbone-react-component').mixin;

var Playlist_List = require('./Playlist_List');
var Playlist_Table = require('./Playlist_Table');

// TODO: turn this into a semantic table

module.exports = React.createClass({
  
  mixins: [ReactBackboneMixin],

  render: function () {

    // determine which view to use
    var Playlist;
    switch (this.props.playlistView) {
      case 'list': Playlist = Playlist_List; break;
      case 'tab': Playlist = Playlist_Table; break;
      default: debug("WARNING: unknown playlistView", this.props.playlistView);
    }

    // make a Playlist for every playlist
    var playlists = this.props.playlists.map(function (playlist) {
      return Playlist({
        'playlist': playlist,
      });
    }.bind(this));

    return (
      <div>
        {playlists}
      </div>
    );
  },

});