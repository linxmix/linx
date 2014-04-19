/** @jsx React.DOM */
var React = require('react');
var ReactBackboneMixin = require('backbone-react-component').mixin;
var debug = require('debug')('views:track/Tracks_Table');

var _ = require('underscore');

var Track_Table_SC = require('./Track_Table_SC');
var Track_Table_Echo = require('./Track_Table_Echo');

module.exports = React.createClass({
  
  mixins: [ReactBackboneMixin],

  getDefaultProps: function () {
    return {
      'isPlaying': false,
      'activeTracks': [],
      'playingTrack': null,
      'className': "ui large inverted purple celled table segment",
      'title': 'Track Title',
    }
  },

  handlePlayClick: function (e) {
    var track = this.props.playingTrack;
    debug("play click", track, this.props.activeTracks[0]);
    if (!track) {
      track = this.props.activeTracks[0];
    }
    this.props.handlePlayClick(track, e);
  },

  onKeyPress: function (e) {
    debug("KEY PRESS", e);
  },

  handleClick: function (row, e) {
    var ctrl = e.ctrlKey || e.metaKey;
    var shift = e.shiftKey;
    var track = row.backboneModel;
    debug("ROW CLICK", ctrl, shift);

    // ctrl => add or remove this track
    if (ctrl) {
      var activeTracks = this.props.activeTracks;
      var index = activeTracks.indexOf(track);
      // track is in activeTracks, so remove it
      if (index > -1) {
        activeTracks.splice(index, 1);
        this.props.setActiveTracks(activeTracks);
      // track is not in activeTracks, so add it
      } else {
        this.props.addActiveTrack(track)
      }

    // shift => add track group
    } else if (shift) {
      var tracks = this.props.tracks;
      var activeTracks = this.props.activeTracks;
      var index = tracks.indexOf(track);
      // if clicked track is already in activeTracks, quit
      if (index === -1) { return; }
      // find closest track in activeTracks
      var closestTrack = _.min(activeTracks, function (activeTrack) {
        return Math.abs(index - tracks.indexOf(activeTrack));
      });
      // add all tracks between closestTrack and track
      var closestIndex = tracks.indexOf(closestTrack);
      var start, end;
      if (index > closestIndex) {
        start = closestIndex + 1;
        end = index;
      } else {
        start = index;
        end = closestIndex - 1;
      }
      for (var i = start; i <= end; i++) {
        activeTracks.push(tracks.at(i));
      }
      this.props.setActiveTracks(activeTracks);

    // nothing => set this track as active
    } else {
      this.props.setActiveTracks([track]);
    }
  },

  // set dragging to activeTracks
  onDragStart: function (row, e) {
    var track = row.backboneModel;
    // first make sure dragging track is in activeTracks
    var activeTracks = this.props.activeTracks;
    var index = activeTracks.indexOf(track);
    if (index === -1) {
      activeTracks.push(track);
      this.props.addActiveTrack(track)
    }
    debug("onDragStart", activeTracks);
    this.props.setDragging(activeTracks);
  },

  // set dragging to none
  onDragEnd: function (e) {
    debug("onDragEnd")
    this.props.setDragging( [] );
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
    var activeTracks = this.props.activeTracks;
    var playingTrack = this.props.playingTrack;
    var tracks = this.props.tracks;
    var track_tables = tracks.map(function (track) {
      // figure out if track is being dragged
      return Track_Table({
        'track': track,
        'active': (activeTracks.indexOf(track) > -1),
        'dragging': (this.props.dragging.indexOf(track) > -1),
        'onDragStart': this.onDragStart,
        'onDragEnd': this.onDragEnd,
        'isPlayingTrack': (track.cid ===
          (playingTrack && playingTrack.cid)),
        'playState': this.props.playState,
        'handleClick': this.handleClick,
        'handleRemoveClick': this.props.handleRemoveClick,
        'handleDblClick': this.props.handleDblClick,
      });
    }.bind(this));

    // determine extra display vars
    var playIcon;
    if (this.props.loading) {
      playIcon = (<i className="loading icon"></i>);
    } else if (this.props.isPlaying) {
      playIcon = (<i className="pause icon"></i>);
    } else {
      playIcon = (<i className="play icon"></i>);
    }
    var numTracksText = (tracks.length == 1) ? ' Track' : ' Tracks';
    return (
      <table
        className={this.props.className}
        onKeyPress={this.onKeyPress}
      >
        <thead>
          <tr>
            <th className="one wide">
              <div className="orange ui icon button"
                onClick={this.handlePlayClick}>
                {playIcon}
              </div>
            </th>
            <th className="fourteen wide">{this.props.title}</th>
            <th className="one wide"><i className="orange time icon"></i></th>
        </tr></thead>
        <tbody>
          {track_tables}
        </tbody>
        <tfoot>
          <tr>
            <th></th>
            <th>{tracks.length}{numTracksText}</th>
            <th></th>
        </tr></tfoot>
      </table>
    );
  },

});