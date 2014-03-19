/** @jsx React.DOM */
var React = require('react');
var ReactBackboneMixin = require('backbone-react-component').mixin;

var clientId = require('../../config').clientId;

module.exports = React.createClass({
  
  mixins: [ReactBackboneMixin],

  render: function () {
    var track = this.props.track;

    return (
      <div>
        <div class="ui label">{track.title}</div>
      </div>
    );
  },

});