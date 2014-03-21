/** @jsx React.DOM */
var React = require('react');
var ReactBackboneMixin = require('backbone-react-component').mixin;

var Track_List = require('./Track_List');

module.exports = React.createClass({
  
  mixins: [ReactBackboneMixin],

  render: function () {

    // make a Track_List for every track
    var track_lists = this.props.tracks.map(function (track) {
      return Track_List({
        'model': {
          'track': track,
        },
        'changePlayState': this.props.changePlayState,
      });
    }.bind(this));

    // set default message
    var defaultMessage = (track_lists.length === 0) ?
      'No tracks found.' : '';

    return (
      <div>
        {defaultMessage}
        {track_lists}
      </div>
    );
  },

});