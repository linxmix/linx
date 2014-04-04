/** @jsx React.DOM */
var React = require('react');
var debug = require('debug')('views:SearchBar');
var ReactBackboneMixin = require('backbone-react-component').mixin;

module.exports = React.createClass({
  
  mixins: [ReactBackboneMixin],

  handleSubmit: function () {
    this.props.executeSearch();
    // prevent default form submission behaviour
    return false;
  },

  handleChange: function () {
    this.props.handleUserInput({
      'searchText':
        this.refs.searchText.getDOMNode().value,
      'searchGenres':
        this.refs.searchGenres.getDOMNode().value,
      'searchTags':
        this.refs.searchTags.getDOMNode().value,
    });
  },

  render: function () {
    return (
      <form onSubmit={this.handleSubmit}>
        <input
          type="text"
          placeholder="Search SoundCloud..."
          value={this.props.searchText}
          ref="searchText"
          onChange={this.handleChange}
        />
        Genres:
        <input
          type="text"
          placeholder="Genre,Genre,Genre, ..."
          value={this.props.searchGenres}
          ref="searchGenres"
          onChange={this.handleChange}
        />
        Tags:
        <input
          type="text"
          placeholder="Tag,Tag,Tag, ..."
          value={this.props.searchTags}
          ref="searchTags"
          onChange={this.handleChange}
        />
        <input type="submit" value="Search"/>
      </form>
    );
  },

});