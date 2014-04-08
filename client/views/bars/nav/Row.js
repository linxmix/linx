/** @jsx React.DOM */
var React = require('react');
var ReactBackboneMixin = require('backbone-react-component').mixin;

module.exports = React.createClass({
  
  mixins: [ReactBackboneMixin],

  getDefaultProps: function () {
    return {
      'active': false,
      'handleClick': function () {}, // no-op
      'handleDblClick': function () {}, // no-op
    }
  },

  handleClick: function(e) {
    e.preventDefault();
    this.props.handleClick(this.props);
  },

  handleDblClick: function(e) {
    e.preventDefault();
    this.props.handleDblClick(e, this.props);
  },

  // TODO: make it so cells can be clicked/active
  render: function () {
    // generate info from data
    var data = (this.props.data && this.props.data.map(function (datum) {
      return (<td>{datum}</td>)
    }));
    // check if row active
    var className = this.props.active ?
      this.props.activeClass : this.props.inactiveClass;
    return (
      <tr
        className={className}
        onClick={this.handleClick}
        ondblclick={this.handleDblClick}>
        {data}
      </tr>
    );
  },

  // bind extra handlers on mount
  componentDidMount: function () {
    console.log("ROW MOUNTED", this.$('tr'));
    this.$('tr').bind('dblclick', function () { console.log("CLICKED")});
  },

});