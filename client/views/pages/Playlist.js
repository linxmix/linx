/** @jsx React.DOM */
var React = require('react');
var Backbone = require('backbone');
var debug = require('debug')('views:pages/Playlist');
var ReactBackboneMixin = require('backbone-react-component').mixin;

var $ = require('jquery');
var keymap = require('browser-keymap');
var _ = require('underscore');

var Tracks_Table = require('../track/Tracks_Table');

module.exports = React.createClass({
  
  mixins: [ReactBackboneMixin],

  getDefaultProps: function () {
    return {
      'listener': _.extend({}, Backbone.Events),
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
      this.props.playViewing(e, { 'track': track });
    }
  },

  render: function () {
    var props = {
      'loading': this.props.loading,
      'playState': this.props.playState,
      'className': this.props.className,
      'trackView': this.state.trackView,
      'dragging': this.props.dragging,
      'setDragging': this.props.setDragging,
      'changePlayState': this.props.changePlayState,
      'handleRemoveClick': this.removeTrack,
      'handlePlayClick': this.props.playpauseViewing,
      'handleDblClick': this.playRow,
      'showHistory': this.state.showHistory,
      'setShowHistory': this.setShowHistory,
    };
    // add props if we have a viewingPlaylist
    var playlist = this.props.viewingPlaylist;
    var tracksTable;
    if (playlist) {
      props['tracks'] = playlist.tracks();
      props['history'] = playlist.history();
      props['playlistName'] = playlist.get('name');
      props['activeTracks'] = playlist.getActiveTracks();
      props['addActiveTrack'] = playlist.addActiveTrack.bind(playlist);
      props['setActiveTracks'] = playlist.setActiveTracks.bind(playlist);
      props['setTrackSort'] = playlist.setTrackSort.bind(playlist);
      props['playingTrack'] = playlist.get('playingTrack');
      props['trackSort'] = playlist.get('trackSort');
      // figure out if playlist is playing
      var playingPlaylist = this.props.playingPlaylist;
      var isAppPlaying = (this.props.playState === 'play');
      props['isPlaying'] = ((isAppPlaying && playingPlaylist) &&
        (playingPlaylist.cid === playlist.cid));
      tracksTable = Tracks_Table(props);
    }
    // create tracks view
    return (
      <div className="playlist">
        {tracksTable}
      </div>
    )
  },

  listenTo: function (playlist) {
    if (playlist) {
      var tracks = playlist.tracks();
      var listener = this.props.listener;
      // need to wrap so calls with no args
      var cb = function () {
        debug("onPlaylistEvent", arguments);
        this.forceUpdate();
      }.bind(this);
      listener.listenTo(tracks, 'add', cb)
      listener.listenTo(tracks, 'remove', cb)
      listener.listenTo(playlist, 'change:playingTrack', cb)
      listener.listenTo(playlist, 'change:activeTracks', cb)
    }
  },

  stopListening: function (playlist) {
    if (playlist) {
      var tracks = playlist.tracks();
      var listener = this.props.listener;
      listener.stopListening(tracks);
      listener.stopListening(playlist);
    }
  },

  resetListener: function (prevPlaylist) {
    this.stopListening(prevPlaylist);
    this.listenTo(this.props.viewingPlaylist);
  },

  componentDidMount: function () {
    this.resetListener();

    // unbind old key press listener
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

  componentWillUnmount: function () {
    this.stopListening(this.props.viewingPlaylist);
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
    this.props.viewingPlaylist.setActiveTracks([]);
  },

  // play selected track
  '\n': function (e) {
    this.props.playViewing(e, { 'playingTrack': false });
  },

  // playpause viewingPlaylist
  ' ': function (e) {
    this.props.playpause();
  },

  // select all tracks
  'C-a': function (e) {
    var playlist = this.props.viewingPlaylist;
    playlist.setActiveTracks(playlist.tracks().models);
  },

}