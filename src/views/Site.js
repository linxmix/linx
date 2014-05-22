/** @jsx React.DOM */
var debug = require('debug')('views:Site')
var React = require('react');
var ReactBackboneMixin = require('backbone-react-component').mixin;

var _ = require('underscore');

var Tracks = require('../collections/Tracks');

var Header = require('./Header');
var Left = require('./Left');
var Main = require('./Main');
var Right = require('./Right');
var Footer = require('./Footer');

// TODO: turn all of these change functions into one that takes 2 args
module.exports = React.createClass({
  
  mixins: [ReactBackboneMixin],

  getInitialState: function () {
    return {
      'page': 'MixBuilder',
      'playState': 'stop',
      'viewingPlaylist': null,
      'playingPlaylist': null,
      'searchText': '',
      'sidebarClosed': false,
      'rightBar': 0,
      'bottomBar': 0,
      'loading': false,
      'dragging': [],
      'uploaderTracks': [],
      'hasLoaded': false,
    }
  },

  //
  // Search
  //

  setSearchText: function (text) {
    this.setState({
      'searchText': text,
    });
  },

  executeSearch: function (e, callback) {
    var searchText = this.state.searchText;
    debug("executing search", searchText);

    // callback to handle search results
    var cb = function (tracks) {
      // filter away tracks that aren't streamable
      tracks = _.filter(tracks, function (track) {
        return !!track['stream_url'];
      });
      // update searchResults with results
      var searchResults = this.props.searchResults;
      searchResults.set({
        'tracks': new Tracks(tracks)
      });
      // update our state
      this.setState({
        'searching': false,
      });
      // maybe set searchResults as viewingPlaylist
      var playlist = this.state.viewingPlaylist;
      if (this.state.page === 'MixBuilder') {
        if ((!playlist) || (playlist.tracks().length < 1)) {
          this.setViewingPlaylist(searchResults);
        }
      } else {
        this.setViewingPlaylist(searchResults);
      }
      // call callback
      callback && callback();
    }.bind(this);

    // do search
    var options = {
      'q': this.state.searchText ? searchText : null,
      'filter': 'streamable', // only return results we can stream
    }
    // TODO: make it so we can do /users and /playlists
    SC.get('/tracks', options, cb)
  },

  //
  // / Search
  //

  addUploaderTrack: function (track) {
    track.analyze({ 'full': true });
    var uploaderTracks = this.state.uploaderTracks;
    uploaderTracks.push(track);
    this.setState({
      'uploaderTracks': uploaderTracks,
    });
  },

  setDragging: function (arr) {
    if (!(arr instanceof Array)) {
      return debug("ERROR: setDragging not given array", ar);
    }
    debug("setDragging", arr);
    this.setState({
      'dragging': arr,
    });
  },

  setSidebarClosed: function (state) {
    this.setState({
      'sidebarClosed': state,
    });
  },

  setLoading: function (bool) {
    debug("setLoading", this.state.hasLoaded, bool);
    if (!this.state.hasLoaded && bool) {
      this.setState({
        'hasLoaded': true,
      });
    }
    this.setState({
      'loading': bool,
    });
  },

  changePage: function (newPage) {
    debug("changePage", newPage);
    this.setState({
      'page': newPage,
    });
  },

  changePlayState: function (newPlayState) {
    debug("changePlayState", newPlayState);
    // TODO: only run change when newPlayState !== playState?
    this.setState({
      'playState': newPlayState,
    });
  },

  playpause: function () {
    if (this.state.playState === 'play') {
      this.changePlayState('pause');
    } else {
      this.changePlayState('play');
    }
  },

  setViewingPlaylist: function (newPlaylist) {
    debug("setViewingPlaylist", newPlaylist);
    // change to correct page for playlist
    var page;
    switch (newPlaylist.get('type')) {
      case 'mix':
        page = 'MixBuilder'; break;
      default:
        page = 'Playlist';
    }
    this.setState({
      'page': page,
      'viewingPlaylist': newPlaylist,
    });
  },

  setPlayingPlaylist: function (newPlaylist) {
    debug("setPlayingPlaylist", newPlaylist);
    this.setState({
      'playingPlaylist': newPlaylist,
    });
  },

  changeBar: function (options) {
    debug("changeBar", options);
    this.setState(options);
  },

  render: function () {
    var left = this.state.leftBar;
    var right = this.state.rightBar;
    var bottom = this.state.bottomBar;
    var props = {
      'me': this.props.me,

      'playState': this.state.playState,
      'playpause': this.playpause,
      'changePlayState': this.changePlayState,

      'dragging': this.state.dragging,
      'setDragging': this.setDragging,

      'uploaderTracks': this.state.uploaderTracks,
      'addUploaderTrack': this.addUploaderTrack,

      'loading': this.state.loading,
      'hasLoaded': this.state.hasLoaded,
      'setLoading': this.setLoading,

      'sidebarClosed': this.state.sidebarClosed,
      'setSidebarClosed': this.setSidebarClosed,

      'searchText': this.state.searchText,
      'setSearchText': this.setSearchText,
      'executeSearch': this.executeSearch,
      'searchResults': this.props.searchResults,

      'viewingPlaylist': this.state.viewingPlaylist,
      'setViewingPlaylist': this.setViewingPlaylist,

      'playingPlaylist': this.state.playingPlaylist,
      'setPlayingPlaylist': this.setPlayingPlaylist,
    }

    return (
      <div>
        {Left(props)}

        {Header(_.extend({
          'page': this.state.page,
          'changePage': this.changePage,
        }, props))}
        {Main(_.extend({
          'page': this.state.page,
          'changePage': this.changePage,
        }, props))}
        {Footer(_.extend({
          'bottomBar': bottom,
          'changeBar': this.changeBar,
        }, props))}

        {Right(_.extend({
          'rightBar': right,
          'changeBar': this.changeBar,
        }, props))}
      </div>
    );
    
  },

});

// converts integer to semantic ui column string
function widthToString(width) {
  switch (width) {
    case 0: return '';
    case 1: return 'column';
    case 2: return 'two wide column';
    case 12: return 'twelve wide column';
    case 13: return 'thirteen wide column';
    case 14: return 'fourteen wide column';
    case 15: return 'fifteen wide column';
    case 16: return 'sixteen wide column';
  }
}