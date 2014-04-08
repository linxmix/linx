/** @jsx React.DOM */
var React = require('react');
var debug = require('debug')('views:pages/Playlist');
var ReactBackboneMixin = require('backbone-react-component').mixin;

var Tracks = require('../track/Tracks');

module.exports = React.createClass({
  
  mixins: [ReactBackboneMixin],

  getInitialState: function() {
    return {
      'trackView': 'list-sc',
    }
  },

  changeTrackView: function(newTrackView) {
    this.setState({
      'trackView': newTrackView,
    });
  },

  render: function () {
    // get tracks from activePlaylist
    console.log("RENDERING PLAYLIST", this.props.activePlaylist)
    var activePlaylist = this.props.activePlaylist;
    var tracks = (activePlaylist && activePlaylist.get('tracks'));
    // create tracks view
    return Tracks({
      'tracks': tracks,
      'trackView': this.state.trackView,
      'changePlayState': this.props.changePlayState,
    });;
  },

});