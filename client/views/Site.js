/** @jsx React.DOM */
var debug = require('debug')('views:Site')
var React = require('react');
var ReactBackboneMixin = require('backbone-react-component').mixin;

var _ = require('underscore');

var Me = require('../models/Me');
var Queue = require('../models/Queue');
var SearchResults = require('../models/SearchResults');

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
    var queue = new Queue({
      'name': 'Queue',
    }, {
      'numWidgets': 2,
    });
    var searchResults = new SearchResults({
      'name': 'Search Results',
    });
    var playlists = new Playlists([searchResults, queue]);
    return {
      'model': {
        me: new Me(),
      },
      'collection': {
        'echoNest': new EchoNest(),
        'tasteProfiles': new TasteProfiles(),
        'playlists': playlists,
      },
      // TODO: use vars above for this. will that be the same?
      'searchResults': playlists.models[0],
      'appQueue':  playlists.models[1],
    };
  },

  getInitialState: function () {
    return {
      'page': 'Playlist',
      'playState': 'stop',
      'viewingPlaylist': this.props.appQueue,
      'playingPlaylist': this.props.appQueue,
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
    });
  },

  setViewingPlaylist: function (newPlaylist) {
    debug("setViewingPlaylist", newPlaylist);
    this.setState({
      'viewingPlaylist': newPlaylist,
    });
    // jump to playlist page whenever setting viewingPlaylist
    this.changePage('Playlist');
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
      'appQueue': this.props.appQueue,

      'playState': this.state.playState,
      'changePlayState': this.changePlayState,

      'searchBarText': this.state.searchBarText,
      'setSearchBarText': this.setSearchBarText,
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