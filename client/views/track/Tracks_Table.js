/** @jsx React.DOM */
var React = require('react');
var ReactBackboneMixin = require('backbone-react-component').mixin;
var debug = require('debug')('views:track/Tracks_Table');

var _ = require('underscore');

var Track_Table_SC = require('./Track_Table_SC');
var Track_Table_Echo = require('./Track_Table_Echo');

var Table_Header = require('../bars/nav/Table_Header');

module.exports = React.createClass({
  
  mixins: [ReactBackboneMixin],

  getDefaultProps: function () {
    return {
      'isPlaying': false,
      'activeTracks': [],
      'playingTrack': null,
      'className': "ui large inverted purple celled sortable table segment",
      'title': 'Track Title',
      'showHistory': false,
      'headers': [
        {
          'key': 'play_status',
          'className': 'one wide',
        },
        {
          'key': 'title',
          'className': 'thirteen wide',
        },
        {
          'key': 'playback_count',
          'className': 'one wide',
          'icon': 'orange play sign icon',
        },
        {
          'key': 'duration',
          'className': 'one wide',
          'icon': 'orange time icon',
        },
      ],
    }
  },

  // TODO: move selection logic into tracks
  handleClick: function (row, e) {
    var ctrl = e.ctrlKey || e.metaKey;
    var shift = e.shiftKey;
    var track = row.backboneModel;
    var activeTracks = this.props.activeTracks;
    debug("ROW CLICK", ctrl, shift);

    // ctrl => add or remove this track
    if (ctrl) {
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

    // nothing => toggle this track as active
    } else {
      // if already the only active track, so make it inactive
      if ((activeTracks.length === 1) &&
        (activeTracks.indexOf(track) > -1)) {
        this.props.setActiveTracks([]);
      // otherwise set this track as active
      } else {
        this.props.setActiveTracks([track]);
      }
    }
  },

  // set dragging to activeTracks
  onDragStart: function (row, e) {
    var track = row.backboneModel;
    // if dragging track is in activeTracks, drag selection
    var activeTracks = this.props.activeTracks;
    var index = activeTracks.indexOf(track);
    // if not in activeTracks, set this track as active and drag
    if (index === -1) {
      activeTracks = [track];
      this.props.setActiveTracks(activeTracks);
    }
    debug("onDragStart", activeTracks);
    this.props.setDragging(activeTracks);
  },

  // set dragging to none
  onDragEnd: function (e) {
    debug("onDragEnd")
    this.props.setDragging( [] );
  },

  handleHeaderClick: function (header) {
    debug("handleHeaderClick", header.key);
    var trackSort = this.props.trackSort;
    // if already sorting by this header, toggle direction
    if (trackSort.key === header.key) {
      this.props.setTrackSort({
        'key': header.key,
        'direction': trackSort.direction * (-1),
      });
    } else {
      this.props.setTrackSort({
        'key': header.key,
        'direction': 1,
      });
    }
  },

  toggleHistory: function (e) {
    this.props.setShowHistory(!this.props.showHistory);
  },

  render: function () {

    // determine which view to use
    var Track_Table;
    switch (this.props.trackView) {
      case 'table-sc': Track_Table = Track_Table_SC; break;
      case 'table-echo': Track_Table = Track_Table_Echo; break;
      default: debug("WARNING: unknown trackView", this.props.trackView);
    }

    //
    // Track_Tables
    //
    var activeTracks = this.props.activeTracks;
    var playingTrack = this.props.playingTrack;
    var tracks = this.props.tracks;
    var history = this.props.history;
    var tracks = (this.props.showHistory) ? history : tracks;
    var track_tables = tracks.map(function (track) {
      return Track_Table({
        'track': track,
        'active': (activeTracks.indexOf(track) > -1),
        'dragging': (this.props.dragging.indexOf(track) > -1),
        'onDragStart': this.onDragStart,
        'onDragEnd': this.onDragEnd,
        'isPlayingTrack': (track.cid ===
          (playingTrack && playingTrack.cid)),
        'isPlaying': this.props.isPlaying,
        'hasPlayed': (history.indexOf(track) > -1),
        'handleClick': this.handleClick,
        'handleRemoveClick': this.props.handleRemoveClick,
        'handleDblClick': this.props.handleDblClick,
      });
    }.bind(this));
    //
    // /end Track_Tables
    //

    // 
    // Table_Headers
    // 
    var headers = this.props.headers.map(function (header) {

      // html needs extra runtime logic
      var html = header.html
      if (header.icon) {
        html = (<i className={header.icon}></i>)
      } else {
        switch (header.key) {
          case 'play_status':
            var playIcon;
            if (this.props.loading) {
              playIcon = (<i className="loading icon"></i>);
            } else if (this.props.isPlaying) {
              playIcon = (<i className="pause icon"></i>);
            } else {
              playIcon = (<i className="play icon"></i>);
            }
            html = (<div className="orange ui icon button"
              onClick={this.props.handlePlayClick}>
                {playIcon}
              </div>); break;
          case 'title':
            var title = this.props.playlistName;
            var historyClass = "micro ui toggle button";
            if (this.props.showHistory) {
              historyClass += " active";
            }
            // TODO: make history button not so ugly!
            //html = (<span>{title}
            //  <div className={historyClass} onClick={this.toggleHistory}>History</div>
            //</span>); break;
            html = title; break;
        }
      }

      // determine className
      var className = header.className;
      var trackSort = this.props.trackSort
      if (trackSort && (trackSort.key === header.key)) {
        var direction = trackSort.direction;
        if (direction === 1) {
          className += ' ascending';
        } else if (direction === -1) {
          className += ' descending';
        }
      }
      return Table_Header({
        'key': header.key,
        'className': className,
        'html': html,
        'handleClick': this.handleHeaderClick,
      });
    }.bind(this));
    // 
    // /end Table_Headers
    // 

    // determine extra display vars
    var numTracksText = (tracks.length == 1) ?
      ' Track' : ' Tracks';

    return (
      <table className={this.props.className}>
        <thead>
          <tr>{headers}</tr>
        </thead>
        <tbody>
          {track_tables}
        </tbody>
        <tfoot>
          <tr>
            <th></th>
            <th>{tracks.length}{numTracksText}</th>
            <th></th>
            <th></th>
        </tr></tfoot>
      </table>
    );
  },

});