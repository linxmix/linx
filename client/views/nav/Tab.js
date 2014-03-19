/** @jsx React.DOM */
var React = require('react');
var ReactBackboneMixin = require('backbone-react-component').mixin;

module.exports = React.createClass({
  
  mixins: [ReactBackboneMixin],

  handleClick: function(e) {
    e.preventDefault();
    this.props.handleClick(this.props);
  },

  render: function () {
    // check if tab active
    var className = this.props.active ?
      this.props.activeClass : this.props.inactiveClass;

    return (
      <a className={className} onClick={this.handleClick}>
        {this.props.name}
      </a>
    );
  },

});