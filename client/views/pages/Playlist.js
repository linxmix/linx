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
    this.props.setPlayingPlaylist(playlist);
    this.props.changePlayState('play');
    playlist.play(track);
  },

  render: function () {
    var playlist = this.props.viewingPlaylist;
    // get tracks from viewingPlaylist
    var tracks = (playlist && playlist.tracks());
    var name = (playlist && playlist.get('name'));
    // figure out if and what we are playing
    var playingPlaylist = this.props.playingPlaylist;
    var isAppPlaying = (this.props.playState === 'play');
    var isPlaying = (isAppPlaying &&
      (playingPlaylist.cid === playlist.cid));
    // create tracks view
    return (
      <div>
        {Tracks_Table({
          'title': name,
          'tracks': tracks,
          'trackView': this.state.trackView,
          'isPlaying': isPlaying,
          'playState': this.props.playState,
          'playingTrack': playingPlaylist.getHead(),
          'changePlayState': this.props.changePlayState,
          'handleDblClick': this.play,
        })}
      </div>
    )
  },

  resetListener: function (prevPlaylist) {
    // force rerender on track change
    var onTrackChange = function (event, track) {
      debug('onTrackChange', event, track);
      this.forceUpdate();
    }.bind(this);
    // remove handler from prevPlaylist
    if (prevPlaylist) {
      prevPlaylist.offTrackChange(onTrackChange);
    }
    // add handler to new playlist
    var playlist = this.props.viewingPlaylist;
    if (playlist) {
      playlist.onTrackChange(onTrackChange);
    }
  },

  componentDidMount: function () {
    this.resetListener();
  },

  componentDidUpdate: function (prevProps, prevState) {
    var prevPlaylist = prevProps.viewingPlaylist;
    var playlist = this.props.viewingPlaylist;
    // switch playlist listener if playlist changed
    if (playlist && ((prevPlaylist && prevPlaylist.cid) !== playlist.cid)) {
      this.resetListener(prevPlaylist);
    }
  },

});