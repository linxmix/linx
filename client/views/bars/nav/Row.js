/** @jsx React.DOM */
var React = require('react');
var ReactBackboneMixin = require('backbone-react-component').mixin;

module.exports = React.createClass({
  
  mixins: [ReactBackboneMixin],

  getDefaultProps: function () {
    return {
      'active': false,
    }
  },

  handleClick: function(e) {
    e.preventDefault();
    this.props.handleClick(this.props);
  },

  // TODO: make it so cells can be clicked/active
  render: function () {
    // generate info from data
    console.log("RENDERING ROW", this.props);
    var data = (this.props.data && this.props.data.map(function (datum) {
      return (<td>{datum}</td>)
    }));
    // check if row active
    var className = this.props.active ?
      this.props.activeClass : this.props.inactiveClass;
    return (
      <tr className={className} onClick={this.handleClick}>
        {data}
      </tr>
    );
  },

});