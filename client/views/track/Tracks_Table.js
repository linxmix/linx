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
      'className': "ui table inverted secondary segment",
    }
  },

  getInitialState: function () {
    return {
      'activeTrack': '',
    }
  },

  setActiveTrack: function (row) {
    this.setState({
      'activeTrack': row.backboneModel,
    });
  },

  render: function () {

    // determine which view to use
    var Track_Table;
    switch (this.props.trackView) {
      case 'table-sc': Track_Table = Track_Table_SC; break;
      case 'table-echo': Track_Table = Track_Table_Echo; break;
      default: debug("WARNING: unknown trackView", this.props.trackView);
    }

    // make sure tracks are at least length 50. if not, add blank rows
    var tracks = this.props.tracks || [];
    var blank_rows = [];
    /* TODO: auto-fill screen with rows */
    //for (var i = (tracks.length - 50); i < 0; i++) {
    //  console.log("appending blank");
    //  // TODO: td needs to be based on how many fields we display
    //  blank_rows.push(<tr><td></td></tr>);
    //}

    // make a Track_Table for every track
    var track_tables = tracks.map(function (track) {
      return Track_Table({
        'track': track,
        'active': (track.cid === this.state.activeTrack.cid),
        'handleClick': this.setActiveTrack,
        'handleDblClick': this.props.handleDblClick,
      });
    }.bind(this));

    // TODO: determine headers via arguments
    return (
      <table className={this.props.className}>
        <thead>
          <tr>
          <th>Track Title</th>
          </tr></thead>
        <tbody>
          {track_tables}
          {blank_rows}
        </tbody>
      </table>
    );
  },

});