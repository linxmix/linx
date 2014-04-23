/** @jsx React.DOM */
var React = require('react');
var ReactBackboneMixin = require('backbone-react-component').mixin;
var debug = require('debug')('views:track/Track_Uploader');

var Track_Wave = require('./Track_Wave');

module.exports = React.createClass({
  
  mixins: [ReactBackboneMixin],

  analyzeSC: function (e) {
    var track = this.props.track;
    this.getCollection().echoNest.analyzeSC({
      'track': track,
      'fullAnalysis': true,
      'success': function (track) {
        debug("FINAL SUCCESS", track);
        // redraw this wave to add beatmarkers
        this.forceUpdate();
      }.bind(this),
    });
  },

  render: function () {
    var track = this.props.track;
    var trackWave = Track_Wave(this.props);

    return (
      <div>
        {trackWave}
        <div className="ui small buttons">
          <div className="ui black button" onClick={this.analyzeSC}>
            Analyze
          </div>
        </div>
      </div>
    );
  },

});