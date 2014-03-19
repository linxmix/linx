/** @jsx React.DOM */
var React = require('react');
var ReactBackboneMixin = require('backbone-react-component').mixin;

var clientId = require('../../config').clientId;

var Track_List = require('./Track_List');

module.exports = React.createClass({
  
  mixins: [ReactBackboneMixin],

  render: function () {
    console.log("rendering Tracks_List:", this.props);

    // make a Track_List for every track
    var track_lists = this.props.tracks.map(function (track) {
      return <Track_List track={track} />
    });

    return (
      <div>
        {track_lists}
      </div>
    );
  },

});