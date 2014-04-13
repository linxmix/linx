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
      'active': false,
      'isPlayingTrack': false,
      'handleClick': function (track) { debug("click unimplemented", track); },
      'handleDblClick': function (track) { debug("dblclick unimplemented", track); },
    }
  },

  render: function () {
    var datum;
    if (this.props.isPlayingTrack) {
      if (this.props.playState === 'play') {
        datum = (<i className="volume up icon"></i>);
      } else {
        datum = (<i className="volume off icon"></i>);
      }
    }
    var track = this.props.track;
    return Row(_.extend({}, {
      'backboneModel': track,
      'key': track.cid,
      'data': [datum, track.get('title')],
      'active': this.props.active,
      'activeClass': 'active',
      'inactiveClass': '',
      'draggable': true,
      'handleClick': this.props.handleClick,
      'handleDblClick': this.props.handleDblClick,
    }));
  },
  
});