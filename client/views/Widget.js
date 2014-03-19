/** @jsx React.DOM */
var React = require('react');
var ReactBackboneMixin = require('backbone-react-component').mixin;

module.exports = React.createClass({
  
  mixins: [ReactBackboneMixin],

  render: function () {
    // check if widget active
    /* TODO: height should not be fixed in pixels */
    var height = this.props.active ? "160px" : "0px";

    return (
        <iframe id={this.props.id} width="100%" height={height}
          scrolling="no" frameBorder="yes"></iframe>
    );
  },

});