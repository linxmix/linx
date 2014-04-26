/** @jsx React.DOM */
var React = require('react');
var debug = require('debug')('views:pages/Playlist');
var ReactBackboneMixin = require('backbone-react-component').mixin;

var $ = require('jquery');
var keymap = require('browser-keymap');

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
    var track = row.backboneModel;
    debug("PLAY ROW", track);
    this.playViewing(e, { 'track': track });
    //this.props.addUploaderTrack(track);
  },

  playpauseViewing: function (e, options) {
    e && e.preventDefault();
    e && e.stopPropagation();
    var playingPlaylist = this.props.playingPlaylist;
    var playlist = this.props.viewingPlaylist;
    var isAppPlaying = (this.props.playState === 'play');
    var isPlaying = (isAppPlaying &&
      (playingPlaylist.cid === playlist.cid));;
    debug("playpauseViewing", isPlaying)
    if (isPlaying) {
      this.props.changePlayState('pause');
    } else {
      this.playViewing(e, options);
    }
  },

  playViewing: function (e, options) {
    var playlist = this.props.viewingPlaylist;
    this.props.setPlayingPlaylist(playlist);
    this.props.changePlayState('play');
    playlist.play(options);
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

  setTrackSort: function (attribute) {
    var playlist = this.props.viewingPlaylist;
    playlist.setTrackSort(attribute);
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
    // if playlist isn't a queue, make it sortable
    var className = 'ui large inverted purple test-main celled table segment';
    if (playlist.get('type') !== 'queue') {
      className += ' sortable';
    }
    // create tracks view
    return (
      <div>
        {Tracks_Table({
          'className': className,
          'playlistName': name,
          'tracks': tracks,
          'appQueue': this.props.appQueue,
          'trackView': this.state.trackView,
          'isPlaying': isPlaying,
          'loading': this.props.loading,
          'playState': this.props.playState,
          'activeTracks': playlist.getActiveTracks(),
          'playingTrack': playlist.get('playingTrack'),
          'trackSort': playlist.get('trackSort'),
          'setTrackSort': this.setTrackSort,
          'dragging': this.props.dragging,
          'setDragging': this.props.setDragging,
          'addActiveTrack': this.addActiveTrack,
          'setActiveTracks': this.setActiveTracks,
          'changePlayState': this.props.changePlayState,
          'handleRemoveClick': this.removeTrack,
          'handlePlayClick': this.playpauseViewing,
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
      try {
        this.forceUpdate();
      } catch (Error) { }
    }.bind(this);
    // add handler to new playlist
    var playlist = this.props.viewingPlaylist;
    if (playlist) {
      playlist.onChange(onPlaylistChange);
    }
  },

  componentDidMount: function () {
    this.resetListener();

    //
    // key press listener
    //
    $(document).keydown(function (e) {
      // ignore key presses when in an input
      if (e.target.tagName !== 'INPUT') {
        // figure out string for keycode
        var key = keymap(e);
        debug("key press", key);
        // make backspace be delete for macs
        if (key === 'backspace') { key = 'delete'; }
        // if key has a handler,
        if (key in SPECIAL_KEYS) {
          // prevent default then call that handler
          e.preventDefault();
          SPECIAL_KEYS[key].call(this, e);
        }
      }
    }.bind(this));
    //
    // /end key press listener
    //

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

// keys and handlers
// TODO: tab to open sidebar
// TODO: [up,down]
// TODO: [shift,ctrl] + [up,down]
//       ^ means moving the selection logic into playlist model
var SPECIAL_KEYS = {

  // back
  'left': function (e) {
    this.props.playingPlaylist.back();
  },

  // forth
  'right': function (e) {
    this.props.playingPlaylist.forth();
  },

  // move selection up
  'up': function (e) {
    debug("up")
  },

  // move selection down
  'down': function (e) {
    debug("down")
  },

  // remove selected tracks from viewingPlaylist
  'delete': function (e) {
    this.props.viewingPlaylist.remove(true);
  },

  // deselect all tracks
  'escape': function (e) {
    this.setActiveTracks([]);
  },

  // play selected track
  '\n': function (e) {
    this.playViewing(e, { 'playingTrack': false });
  },

  // playpause viewingPlaylist
  ' ': function (e) {
    this.props.playpause();
  },

  // select all tracks
  'C-a': function (e) {
    this.setActiveTracks(this.props.viewingPlaylist.tracks().models);
  },

}