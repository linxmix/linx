/** @jsx React.DOM */
var React = require('react');
var ReactBackboneMixin = require('backbone-react-component').mixin;

module.exports = React.createClass({
  
  mixins: [ReactBackboneMixin],

  // TODO: move icon stuff into here

  getDefaultProps: function () {
    return {
      'className': "ui small field icon input",
      'placeholder': "Search...",
      'value': '',
    }
  },

  handleSubmit: function (e) {
    this.props.handleSubmit(this.props);
    return false;
  },

  handleChange: function (e) {
    this.props.handleChange({
      'searchText':
        this.refs.searchText.getDOMNode().value,
    })
  },

  render: function () {
    return (
      <form onSubmit={this.handleSubmit}>
        <div className={this.props.className}>
          <input
            type="text"
            placeholder={this.props.placeholder}
            value={this.props.value}
            ref="searchText"
            onChange={this.handleChange}>
            {this.props.text}
          </input>
        </div>
      </form>
    );
  },

});