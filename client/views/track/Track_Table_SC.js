/** @jsx React.DOM */
var React = require('react');
var ReactBackboneMixin = require('backbone-react-component').mixin;
var debug = require('debug')('views:track/Track_Table_SC');

var _ = require('underscore');

var Row = require('../bars/nav/Row');

module.exports = React.createClass({
  
  mixins: [ReactBackboneMixin],

  getDefaultProps: function () {
    return {
      'handleClick': function (track) { debug("click unimplemented", track); },
      'handleDblClick': function (track) { debug("dblclick unimplemented", track); },
    }
  },

  render: function () {
    var track = this.props.track;
    return Row(_.extend({}, {
      'backboneModel': track,
      'key': track.cid,
      'data': [track.get('title')],
      'active': this.props.active,
      'activeClass': 'positive',
      'inactiveClass': '',
      'draggable': true,
      'handleClick': this.props.handleClick,
      'handleDblClick': this.props.handleDblClick,
    }));
  },
  
});