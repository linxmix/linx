/** @jsx React.DOM */
var React = require('react');
var ReactBackboneMixin = require('backbone-react-component').mixin;

var clientId = require('../../config').clientId;

var Track_Wave = require('./Track_Wave');

module.exports = React.createClass({
  
  mixins: [ReactBackboneMixin],

  render: function () {
    console.log("rendering Tracks_Wave:", this.props);

    // make a Track_Wave for every track
    var track_waves = this.props.tracks.map(function (track) {
      return <Track_Wave track={track} />
    });

    return (
      <div>
        {track_waves}
      </div>
    );
  },

});