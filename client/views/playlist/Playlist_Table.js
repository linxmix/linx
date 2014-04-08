/** @jsx React.DOM */
var React = require('react');
var ReactBackboneMixin = require('backbone-react-component').mixin;
var debug = require('debug')('views:playlist/Playlist_Table');

var _ = require('underscore');

var Row = require('../bars/nav/Row');

module.exports = React.createClass({
  
  mixins: [ReactBackboneMixin],

  render: function () {
    var playlist = this.props.playlist;
    return Row(_.extend({}, playlist, {
        'data': [playlist.get('name')],
        'active': this.props.active,
        'activeClass': 'positive',
        'inactiveClass': '',
        'handleClick': this.props.handleClick,
    }));
  },

});