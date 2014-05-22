/** @jsx React.DOM */
var debug = require('debug')('views:Main')
var React = require('react');
var ReactBackboneMixin = require('backbone-react-component').mixin;

var _ = require('underscore');

var Me = require('./pages/Me');
var Search = require('./pages/Search');
var Queue = require('./pages/Queue');
var Uploader = require('./pages/Uploader');
var LinxMap = require('./pages/LinxMap');
var Playlist = require('./pages/Playlist');
var MixBuilder = require('./pages/MixBuilder');

module.exports = React.createClass({
  
  mixins: [ReactBackboneMixin],

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

  render: function () {
    var renderedPage;
    var props = _.extend({
      'playViewing': this.playViewing,
      'playpauseViewing': this.playpauseViewing,
    }, this.props);

    // render the current page
    // TODO: make it so that this.props.page determines
    //       page by string variable selection instead of switch
    switch (props.page) {
      case 'Me':
        renderedPage = Me(props);
        break;
      case 'Uploader':
        renderedPage = Uploader(props);
        break;
      case 'LinxMap':
        renderedPage = LinxMap(props);
        break;
      case 'Playlist':
        renderedPage = Playlist(props);
        break;
      case 'MixBuilder':
        renderedPage = MixBuilder(props);
        break;
      case 'Search':
        renderedPage = Search(props);
        break;
      default:
        debug("warning, unknown page: " + this.props.page);
    }

    return (
      <main className="main-container">
        {renderedPage}
      </main>
    );
  },

  componentDidMount: function () {

/*
    var tasteProfiles = this.getCollection().tasteProfiles;
    console.log("FETCHING TasteProfiles", tasteProfiles);
    tasteProfiles.fetch({
      'success': function(collection, response, options) {
        console.log("SUCCESS", collection, response, options);
      },
      'error': function(collection, response, options) {
        console.log("ERROR", collection, response, options);
      },
    });
  */
  },

});