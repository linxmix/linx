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

  // play viewingPlaylist with given track at head
  playRow: function (row, e) {
    var playlist = this.props.viewingPlaylist;
    var track = row.backboneModel;
    this.props.setPlayingPlaylist(playlist);
    this.props.changePlayState('play');
    playlist.play(track);
  },

  // playpause viewingPlaylist
  playViewingPlaylist: function (track, e) {
    var playingPlaylist = this.props.playingPlaylist;
    var playlist = this.props.viewingPlaylist;
    var isAppPlaying = (this.props.playState === 'play');
    var isPlaying = (isAppPlaying &&
      (playingPlaylist.cid === playlist.cid));;
    debug("play click", isPlaying, track)
    if (isPlaying) {
      this.props.changePlayState('pause');
    } else {
      var playlist = this.props.viewingPlaylist;
      // play playlist and track if track exists
      this.props.setPlayingPlaylist(playlist);
      if (track) {
        this.props.changePlayState('play');
        playlist.play(track);
      }
    }
  },

  removeTrack: function (track, e) {
    debug("removing track", track);
    this.props.viewingPlaylist.remove(track);
  },

  addActiveTrack: function (track) {
    var playlist = this.props.viewingPlaylist;
    var activeTracks = playlist.getActiveTracks();
    activeTracks.push(track);
    this.setActiveTracks(activeTracks)
  },

  setActiveTracks: function (tracks) {
    if (!(tracks instanceof Array)) {
      return debug("ERROR: setActiveTracks not given array", tracks);
    }
    var playlist = this.props.viewingPlaylist;
    // TODO: make sure they are in the same order as they are displayed on screen
    playlist.set({ 'activeTracks': tracks });
    this.forceUpdate();
  },

  render: function () {
    var playlist = this.props.viewingPlaylist;
    // get tracks from viewingPlaylist
    var tracks = (playlist && playlist.tracks());
    var name = (playlist && playlist.get('name'));
    // figure out if this playlist is playing
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
          'loading': this.props.loading,
          'playState': this.props.playState,
          'activeTracks': playlist.getActiveTracks(),
          'playingTrack': playlist.get('playingTrack'),
          'dragging': this.props.dragging,
          'setDragging': this.props.setDragging,
          'addActiveTrack': this.addActiveTrack,
          'setActiveTracks': this.setActiveTracks,
          'changePlayState': this.props.changePlayState,
          'handleRemoveClick': this.removeTrack,
          'handlePlayClick': this.playViewingPlaylist,
          'handleDblClick': this.playRow,
        })}
      </div>
    )
  },

  resetListener: function (prevPlaylist) {
    // remove handler from prevPlaylist
    if (prevPlaylist && this.onPlaylistChange) {
      prevPlaylist.offChange(this.onPlaylistChange);
    }
    // force rerender on track change
    var onPlaylistChange = this.onPlaylistChange = function () {
      debug('onPlaylistChange', arguments);
      this.forceUpdate();
    }.bind(this);
    // add handler to new playlist
    var playlist = this.props.viewingPlaylist;
    if (playlist) {
      playlist.onChange(onPlaylistChange);
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