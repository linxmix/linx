/** @jsx React.DOM */
var React = require('react');
var ReactBackboneMixin = require('backbone-react-component').mixin;
var debug = require('debug')('views:playlist/Playlist_Table');

var _ = require('underscore');

var Row = require('../bars/nav/Row');

module.exports = React.createClass({
  
  mixins: [ReactBackboneMixin],

  onDrop: function (e) {
    e.stopPropagation();
    // recover object from json
    var obj = JSON.parse(e.nativeEvent.dataTransfer.getData('application/json'));
    // if object is a track, add it to this playlist
    if (obj.kind === 'track') {
      console.log(this.props.playlist);
      this.props.playlist.add(obj)
    }
    // if object is a playlist, add that playlist to this
    // TODO: make playlists draggable?
  },

  render: function () {
    var playlist = this.props.playlist;
    return Row(_.extend({}, playlist, {
        'key': playlist.cid,
        'data': [playlist.get('name')],
        'active': this.props.active,
        'activeClass': 'positive',
        'dragOverClass': 'drag-over',
        'onDrop': this.onDrop,
        'inactiveClass': '',
        'handleClick': this.props.handleClick,
    }));
  },

});