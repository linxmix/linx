/** @jsx React.DOM */
var debug = require('debug')('views:App')
var React = require('react');
var ReactBackboneMixin = require('backbone-react-component').mixin;

var _ = require('underscore');

var Me = require('../models/Me');
var Playlist = require('../models/Playlist');

var Queue = require('../collections/Queue');
var Widgets = require('../collections/Widgets');
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
    var queue = new Queue();
    var queuePlaylist = new Playlist({
      'name': 'Queue',
      'tracks': queue,
    });
    var playlists = new Playlists([queuePlaylist]);
    return {
      'model': {
        me: new Me(),
      },
      'collection': {
        'queue': queue,
        'echoNest': new EchoNest(),
        'tasteProfiles': new TasteProfiles(),
        'playlists': playlists,
        'myTracks': new Tracks(),
        // TODO: move this into soundbar?
        'widgets': new Widgets(),
      },
    };
  },

  getInitialState: function () {
    return {
      'page': 'Playlist',
      'playState': 'pause',
      'activePlaylist': '',
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
    this.setState({
      'playState': newPlayState,
    });
  },

  // jump to playlists page whenever setting active playlist
  setActivePlaylist: function (newPlaylist) {
    debug("setActivePlaylist", newPlaylist);
    this.setState({
      'activePlaylist': newPlaylist,
    });
    this.changePage('Playlist');
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
      'searchBarText': this.state.searchBarText,
      'setSearchBarText': this.setSearchBarText,
      'changePlayState': this.changePlayState,
      'activePlaylist': this.state.activePlaylist,
      'setActivePlaylist': this.setActivePlaylist,
      'tracks': new Tracks(),
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