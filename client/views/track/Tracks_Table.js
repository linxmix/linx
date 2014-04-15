/** @jsx React.DOM */
var React = require('react');
var ReactBackboneMixin = require('backbone-react-component').mixin;
var debug = require('debug')('views:track/Tracks_Table');

var Track_Table_SC = require('./Track_Table_SC');
var Track_Table_Echo = require('./Track_Table_Echo');

module.exports = React.createClass({
  
  mixins: [ReactBackboneMixin],

  getDefaultProps: function () {
    return {
      'isPlaying': false,
      'activeTrack': null,
      'playingTrack': null,
      'className': "ui large inverted purple celled table segment",
      'title': 'Track Title',
    }
  },

  handlePlayClick: function (e) {
    var track = this.props.playingTrack
    if (!track || !this.props.isPlaying) {
      track = this.props.activeTrack;
    }
    this.props.handlePlayClick(track, e);
  },

  handleClick: function (row) {
    this.props.setActiveTrack(row.backboneModel);
  },

  render: function () {

    // determine which view to use
    var Track_Table;
    switch (this.props.trackView) {
      case 'table-sc': Track_Table = Track_Table_SC; break;
      case 'table-echo': Track_Table = Track_Table_Echo; break;
      default: debug("WARNING: unknown trackView", this.props.trackView);
    }

    // make a Track_Table for every track
    var activeTrack = this.props.activeTrack;
    var playingTrack = this.props.playingTrack;
    var tracks = this.props.tracks || [];
    var track_tables = tracks.map(function (track) {
      return Track_Table({
        'track': track,
        'active': (track.cid ===
          (activeTrack && activeTrack.cid)),
        'isPlayingTrack': (track.cid ===
          (playingTrack && playingTrack.cid)),
        'playState': this.props.playState,
        'handleClick': this.handleClick,
        'handleDblClick': this.props.handleDblClick,
      });
    }.bind(this));

    // determine extra display vars
    var playIcon = (this.props.isPlaying) ?
      (<i className="pause icon"></i>) :
      (<i className="play icon"></i>);
    var numTracksText = (tracks.length == 1) ? ' Track' : ' Tracks';
    return (
      <table className={this.props.className}>
        <thead>
          <tr>
            <th className="one wide">
              <div className="orange ui icon button"
                onClick={this.handlePlayClick}>
                {playIcon}
              </div>
            </th>
            <th className="fifteen wide">{this.props.title}</th>
        </tr></thead>
        <tbody>
          {track_tables}
        </tbody>
        <tfoot>
          <tr>
            <th></th>
            <th>{tracks.length}{numTracksText}</th>
        </tr></tfoot>
      </table>
    );
  },

});