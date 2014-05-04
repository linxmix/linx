/** @jsx React.DOM */
var React = require('react');
var debug = require('debug')('views:pages/Playlist');
var ReactBackboneMixin = require('backbone-react-component').mixin;

var $ = require('jquery');
var keymap = require('browser-keymap');

var Tracks_Table = require('../track/Tracks_Table');

module.exports = React.createClass({
  
  mixins: [ReactBackboneMixin],

  getDefaultProps: function () {
    return {
      'className': 'ui large sortable inverted purple test-main celled table segment',
    }
  },

  getInitialState: function () {
    return {
      'trackView': 'table-sc',
      'showHistory': false,
    }
  },

  // TODO: make it so this can be changed
  changeTrackView: function (newTrackView) {
    this.setState({
      'trackView': newTrackView,
    });
  },

  setShowHistory: function (bool) {
    debug("showing history")
    this.setState({ 'showHistory': bool });
  },

  // play viewingPlaylist with given track at head
  playRow: function (row, e) {
    var track = row.backboneModel;
    var ctrl = e.ctrlKey || e.metaKey;
    debug("PLAY ROW", track, e, ctrl);
    if (ctrl) {
      this.props.addUploaderTrack(track);
    } else {
      this.playViewing(e, { 'track': track });
    }
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
  },

  setTrackSort: function (attribute) {
    var playlist = this.props.viewingPlaylist;
    playlist.setTrackSort(attribute);
  },

  render: function () {
    var options = {
      'loading': this.props.loading,
      'playState': this.props.playState,
      'className': this.props.className,
      'trackView': this.state.trackView,
      'setTrackSort': this.setTrackSort,
      'dragging': this.props.dragging,
      'setDragging': this.props.setDragging,
      'addActiveTrack': this.addActiveTrack,
      'setActiveTracks': this.setActiveTracks,
      'changePlayState': this.props.changePlayState,
      'handleRemoveClick': this.removeTrack,
      'handlePlayClick': this.playpauseViewing,
      'handleDblClick': this.playRow,
      'showHistory': this.state.showHistory,
      'setShowHistory': this.setShowHistory,
    };
    // add options if we have a viewingPlaylist
    var playlist = this.props.viewingPlaylist;
    var tracksTable;
    if (playlist) {
      options['tracks'] = playlist.tracks();
      options['history'] = playlist.history();
      options['playlistName'] = playlist.get('name');
      options['activeTracks'] = playlist.getActiveTracks();
      options['playingTrack'] = playlist.get('playingTrack');
      options['trackSort'] = playlist.get('trackSort');
      // figure out if playlist is playing
      var playingPlaylist = this.props.playingPlaylist;
      var isAppPlaying = (this.props.playState === 'play');
      options['isPlaying'] = ((isAppPlaying && playingPlaylist) &&
        (playingPlaylist.cid === playlist.cid));
      tracksTable = Tracks_Table(options);
    }
    // create tracks view
    return (
      <div>
        {tracksTable}
      </div>
    )
  },

  resetListener: function (prevPlaylist) {
    // remove handler from prevPlaylist
    if (prevPlaylist && this.onPlaylistEvent) {
      prevPlaylist.offEvents(this.onPlaylistEvent);
    }
    // force rerender on track change
    var onPlaylistEvent = this.onPlaylistEvent || function () {
      debug('onPlaylistEvent', arguments);
      try {
        this.forceUpdate();
      } catch (Error) { }
    }.bind(this);
    // add handler to new playlist
    var playlist = this.props.viewingPlaylist;
    if (playlist) {
      playlist.onEvents(onPlaylistEvent);
    }
  },

  componentDidMount: function () {
    this.resetListener();

    // unbind old listener
    $(document).unbind('keydown');

    // key press listener
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
    this.props.viewingPlaylist.remove(null, {
      'activeTracks': true,
    });
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