/** @jsx React.DOM */
var React = require('react');
var ReactBackboneMixin = require('backbone-react-component').mixin;
var debug = require('debug')('views:track/Track_Uploader');

var _ = require('underscore');

var Widget_Wave = require('../../models/Widget_Wave');
var Track_Wave = require('./Track_Wave');

module.exports = React.createClass({
  
  mixins: [ReactBackboneMixin],

  getDefaultProps: function () {
    return {
      'widget': new Widget_Wave(),
    }
  },

  play: function (e) {
    this.props.widget.play();
  },

  pause: function (e) {
    this.props.widget.pause();
  },

  render: function () {
    var trackWave = Track_Wave(this.props);
    return (
      <div>
        {trackWave}
        <div className="ui small buttons">
          <div className="ui black button" onClick={this.play}>
            Play
          </div>
          <div className="ui black button" onClick={this.pause}>
            Pause
          </div>
        </div>
      </div>
    );
  },

});