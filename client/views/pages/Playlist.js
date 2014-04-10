/** @jsx React.DOM */
var React = require('react');
var debug = require('debug')('views:pages/Playlist');
var ReactBackboneMixin = require('backbone-react-component').mixin;

var Tracks_Table = require('../track/Tracks_Table');

module.exports = React.createClass({
  
  mixins: [ReactBackboneMixin],

  getInitialState: function () {
    return {
      'trackView': 'table-sc',
    }
  },

  // TODO: make it so this can be changed
  changeTrackView: function (newTrackView) {
    this.setState({
      'trackView': newTrackView,
    });
  },

  // play this playlist with given track at head
  play: function (row, e) {
    var playlist = this.props.viewingPlaylist;
    var track = row.backboneModel;
    // if viewingPlaylist is searchResults, play in queue instead
    if (playlist.get('type') === 'searchResults') {
      playlist = this.props.appQueue;
    }
    this.props.changePlayState('play');
    playlist.queueAtPos(track, 0);
    this.props.setPlayingPlaylist(playlist);
  },

  render: function () {
    var playlist = this.props.viewingPlaylist;
    // get tracks from viewingPlaylist
    var tracks = (playlist && playlist.tracks());
    var name = (playlist && playlist.get('name'));
    // create tracks view
    // TODO: display playlist name better
    return (
      <div>
        <div className="purple ui label">
          {name}
        </div>
        {Tracks_Table({
          'tracks': tracks,
          'trackView': this.state.trackView,
          'changePlayState': this.props.changePlayState,
          'handleDblClick': this.play,
        })}
      </div>
    )
  },

});