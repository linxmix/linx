/** @jsx React.DOM */
var React = require('react');
var ReactBackboneMixin = require('backbone-react-component').mixin;

module.exports = React.createClass({
  
  mixins: [ReactBackboneMixin],

  // on click, change page to this tab
  handleClick: function(e) {
    e.preventDefault();
    this.props.changePage(this.props.key);
  },

  render: function () {
    var className = this.props.active ? 'active item' : 'item';

    return (
      <a className={className} onClick={this.handleClick}>
        {this.props.name}
      </a>
    );
  },

});