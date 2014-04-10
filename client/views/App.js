/** @jsx React.DOM */
var debug = require('debug')('views:App')
var React = require('react');
var ReactBackboneMixin = require('backbone-react-component').mixin;

var _ = require('underscore');

var Me = require('../models/Me');
var Playlist = require('../models/Playlist');

var Tracks = require('../collections/Tracks');
var EchoNest = require('../collections/EchoNest');
var TasteProfiles = require('../collections/TasteProfiles');
var Playlists = require('../collections/Playlists');

var Header = require('./Header');
var Left = require('./Left');
var Main = require('./Main');
var Right = require('./Right');
var Footer = require('./Footer');

module.exports = React.createClass({
  
  mixins: [ReactBackboneMixin],

  getDefaultProps: function () {
    // TODO: make appQueue initialize from user's stored queue
    var playlists = new Playlists([{
      'name': 'Queue',
      'type': 'queue',
    }, {
      'numWidgets': 2,
    }]);
    return {
      'model': {
        me: new Me(),
      },
      'collection': {
        'echoNest': new EchoNest(),
        'tasteProfiles': new TasteProfiles(),
        'playlists': playlists,
        'myTracks': new Tracks(),
      },
      'appQueue':  playlists.models[0],
    };
  },

  getInitialState: function () {
    return {
      'page': 'Playlist',
      'playState': 'pause',
      'viewingPlaylist': '',
      'playingPlaylist': '',
      'searchBarText': '',
      'rightBar': 0,
      'bottomBar': 0,
    }
  },

  setSearchBarText: function (text) {
    this.setState({
      'searchBarText': text,
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
    // always reassert playState when changing
    }, this.assertPlayState);
  },

  setViewingPlaylist: function (newPlaylist) {
    debug("setViewingPlaylist", newPlaylist);
    this.setState({
      'viewingPlaylist': newPlaylist,
    });
    // jump to playlist page whenever setting viewingPlaylist
    this.changePage('Playlist');
  },

  // TODO: if that playlist is already playing,
  //       add given track to head or something
  setPlayingPlaylist: function (newPlaylist) {
    debug("setPlayingPlaylist", newPlaylist);
    this.setState({
      'playingPlaylist': newPlaylist,
    // always reassert playState
    }, this.assertPlayState);
  },

  changeBar: function (options) {
    debug("changeBar", options);
    this.setState(options);
  },

  assertPlayState: function () {
    var playState = this.state.playState;
    var playlist = this.state.playingPlaylist;
    debug('asserting play state', playState, playlist);
    playlist && playlist.assertPlayState(playState);
  },

  // skip back in the playingPlaylist
  back: function () {
    var playlist = this.state.playingPlaylist;
    playlist.back();
  },

  // skip forth in the playingPlaylist
  forth: function  () {
    var playlist = this.state.playingPlaylist;
    playlist.forth();
  },

  render: function () {
    var left = this.state.leftBar;
    var right = this.state.rightBar;
    var bottom = this.state.bottomBar;
    var props = {
      'me': this.props.me,
      'appQueue': this.props.appQueue,

      'playState': this.state.playState,
      'changePlayState': this.changePlayState,
      'forth': this.forth,
      'back': this.back,

      'searchBarText': this.state.searchBarText,
      'setSearchBarText': this.setSearchBarText,

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