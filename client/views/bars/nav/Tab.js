/** @jsx React.DOM */
var React = require('react');
var ReactBackboneMixin = require('backbone-react-component').mixin;

module.exports = React.createClass({
  
  mixins: [ReactBackboneMixin],

  getDefaultProps: function () {
    return {
      'handleClick': function () {},
      'handleDblClick': function () {},
    }
  },

  handleClick: function(e) {
    e.preventDefault();
    this.props.handleClick(this.props, e);
  },

  handleDblClick: function(e) {
    e.preventDefault();
    this.props.handleDblClick(this.props, e);
  },

  render: function () {
    // check if tab active
    var className = this.props.active ?
      this.props.activeClass : this.props.inactiveClass;

    return (
      <a
        className={className}
        onClick={this.handleClick}
        onDoubleClick={this.handleDblClick}>
        {this.props.name}
      </a>
    );
  },

});