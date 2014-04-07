/** @jsx React.DOM */
var React = require('react');
var ReactBackboneMixin = require('backbone-react-component').mixin;
var debug = require('debug')('views:playlist/Playlist_Table');

var Row = require('../bars/nav/Row');

module.exports = React.createClass({
  
  mixins: [ReactBackboneMixin],

  render: function () {
    var playlist = this.props.playlist;
    console.log("RENDERING PLAYLIST", playlist);
    return Row({
        'key': playlist.cid,
        'data': [playlist.get('name')],
        'active': this.props.active,
        'activeClass': 'positive',
        'inactiveClass': '',
        'handleClick': this.props.handleClick,
    })
  },

});