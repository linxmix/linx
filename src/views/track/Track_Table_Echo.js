/** @jsx React.DOM */
var React = require('react');
var ReactBackboneMixin = require('backbone-react-component').mixin;
var debug = require('debug')('views:track/Track_Table_SC');

module.exports = React.createClass({
  
  mixins: [ReactBackboneMixin],

  // TODO
  // view this track
  viewTrack: function () {
    var track = this.props.track;
    debug("viewing track", track);
  },

  // TODO
  // find this track's equivalent on SoundCloud
  findOnSC: function() {
    var track = this.props.track;
    debug("finding track on SC", track);
  },

  render: function () {
    var track = this.props.track;

    return (
      <div className="ui secondary inverted purple segment">
        <div className="ui label">{track.get('title')}</div>
        <div className="ui label">{track.get('artist_name')}</div>
        <div className="ui small button" onClick={this.viewTrack}>View Track</div>
        <div className="ui small button" onClick={this.findOnSC}>Find On SoundCloud</div>
      </div>
    );
  },

});