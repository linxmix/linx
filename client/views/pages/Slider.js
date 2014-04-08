/** @jsx React.DOM */
var React = require('react');
var debug = require('debug')('views:pages/slider');
var ReactBackboneMixin = require('backbone-react-component').mixin;

var PlaylistSidebar = require('./PlaylistSidebar');

module.exports = React.createClass({
  
  mixins: [ReactBackboneMixin],

  getDefaultProps: function () {
    return {
      min: 0,
      max: 1,
      step: 0.01,
      value: 0.5,
    }
  },

  render: function () {
    return (
      <input type="range"
        min={this.props.min}
        max={this.props.max}
        step={this.props.step}
        onChange={this.props.onChange}>
        {this.props.text}
      </input>
    );
  },

  // rendered component has been mounted to a DOM element
  componentDidMount: function () {
    var val = this.props.value;
    if (typeof val !== 'undefined') {
      // init slider to value
      console.log("slider mounted", val, typeof val);
    }
  },

});