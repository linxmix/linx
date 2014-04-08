/** @jsx React.DOM */
var React = require('react');
var ReactBackboneMixin = require('backbone-react-component').mixin;

var Track_Table_SC = require('./Track_Table_SC');
var Track_Table_Echo = require('./Track_Table_Echo');

module.exports = React.createClass({
  
  mixins: [ReactBackboneMixin],

  getDefaultProps: function () {
    return {
      'className': "ui table segment",
    }
  },

  getInitialState: function () {
    return {
      'activeTrack': '',
    }
  },

  setActivetrack: function (track) {
    this.setState({
      'activeTrack': track,
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

    // make a Track_Table for every track
    var tracks = this.props.tracks && this.props.tracks.map(function (track) {
      return Track_Table({
        'active': (track.cid === this.state.activeTrack.cid),
        'track': track,
        'handleClick': this.setActivetrack,
        'changePlayState': this.props.changePlayState,
      });
    }.bind(this));

    // TODO: determine headers via arguments
    return (
      <table className={this.props.className}>
        <thead>
          <tr>
          <th>Title</th>
          </tr></thead>
        <tbody>
          {tracks}
        </tbody>
      </table>
    );
  },

});