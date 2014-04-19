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
      'handleRemoveClick': function (track) { debug("removeClick unimplemented", track); },
      'handleDblClick': function (track) { debug("dblclick unimplemented", track); },
    }
  },

  render: function () {
    var track = this.props.track;
    // calculate human readable duration
    var time = new Date(track.get('duration'));
    var hours = time.getUTCHours();
    var minutes = time.getUTCMinutes();
    var seconds = duration = twoDigits(time.getUTCSeconds());
    if (hours) {
      duration = hours + ":" + twoDigits(minutes) + ":" + duration;
    } else {
      duration = minutes + ":" + duration;
    }
    // figure out what play icon to display
    var datum;
    if (this.props.isPlayingTrack) {
      if (this.props.playState === 'play') {
        datum = (<i className="volume up icon"></i>);
      } else {
        datum = (<i className="volume off icon"></i>);
      }
    }
    // render track row
    return Row(_.extend({}, {
      'backboneModel': track,
      'key': track.cid,
      'data': [datum, track.get('title'), duration],
      'active': this.props.active,
      'dragging': this.props.dragging,
      'draggable': true,
      'onDragStart': this.props.onDragStart,
      'onDragEnd': this.props.onDragEnd,
      'handleClick': this.props.handleClick,
      'handleDblClick': this.props.handleDblClick,
    }));
  },
  
});

function twoDigits(n) {
  return ("0" + n).slice(-2);
}