/** @jsx React.DOM */
var React = require('react');
var ReactBackboneMixin = require('backbone-react-component').mixin;

module.exports = React.createClass({
  
  mixins: [ReactBackboneMixin],

  getDefaultProps: function () {
    return {
      'html': '',
      'className': '',
      'handleClick': function () {}, // no-op
      'handleDblClick': function () {}, // no-op
    }
  },

  handleClick: function(e) {
    e.preventDefault();
    this.props.handleClick(this.props, e);
  },

  render: function () {
    return (
      <th
        className={this.props.className}
        onClick={this.handleClick}>
        {this.props.html}
      </th>
    );
  },

});