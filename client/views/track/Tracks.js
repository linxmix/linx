/** @jsx React.DOM */
var React = require('react');
var ReactBackboneMixin = require('backbone-react-component').mixin;

var Track_List_SC = require('./Track_List_SC');
var Track_List_Echo = require('./Track_List_Echo');
var Track_Wave = require('./Track_Wave');

// TODO: turn this into a semantic table

module.exports = React.createClass({
  
  mixins: [ReactBackboneMixin],

  render: function () {

    // determine which view to use
    var Track;
    switch (this.props.trackView) {
      case 'list-sc': Track = Track_List_SC; break;
      case 'list-echo': Track = Track_List_Echo; break;
      case 'wave': Track = Track_Wave; break;
      default: debug("WARNING: unknown trackView", this.props.trackView);
    }

    // make a Track for every track
    var tracks = this.props.tracks.map(function (track) {
      return Track({
        'track': track,
        'changePlayState': this.props.changePlayState,
      });
    }.bind(this));

    return (
      <div>
        {tracks}
      </div>
    );
  },

});