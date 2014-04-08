/** @jsx React.DOM */
var React = require('react');
var debug = require('debug')('views:pages/Playlist');
var ReactBackboneMixin = require('backbone-react-component').mixin;

var Tracks_Table = require('../track/Tracks_Table');

module.exports = React.createClass({
  
  mixins: [ReactBackboneMixin],

  getInitialState: function() {
    return {
      'trackView': 'table-sc',
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
    var tracks = (activePlaylist && activePlaylist.tracks());
    var name = (activePlaylist && activePlaylist.get('name'));
    // create tracks view
    return Tracks_Table({
      'tracks': tracks,
      'playlistName': name,
      'trackView': this.state.trackView,
      'changePlayState': this.props.changePlayState,
    });;
  },

});