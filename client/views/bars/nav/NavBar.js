/** @jsx React.DOM */
var React = require('react');
var ReactBackboneMixin = require('backbone-react-component').mixin;

var Tab = require('./Tab');
var SearchInput = require('./SearchInput');

module.exports = React.createClass({
  
  mixins: [ReactBackboneMixin],

  getDefaultProps: function () {
    return {
      'navTabs': ['Me', 'Settings'],
    }
  },

  getInitialState: function () {
    return {
      'searching': false,
    }
  },

  handleClick: function(navTab) {
    this.props.changePage(navTab.key);
  },

  handleChange: function (options) {
    this.props.setSearchText(options.searchText);
  },

  handleSubmit: function () {
    this.setState({ 'searching': true });
    this.props.executeSearch(null, function () {
      this.setState({ 'searching': false });
    }.bind(this));
  },

  render: function () {

    // make navTabs
    var navTabs = this.props.navTabs.map(function(navTab) {
      return (
        Tab({
          'active': (navTab === this.props.page),
          'key': navTab,
          'name': navTab,
          'activeClass': 'active item',
          'inactiveClass': 'item',
          'handleClick': this.handleClick,
        })
      )
    }.bind(this));

    // determine searching icon
    var searchIcon = (this.state.searching) ?
      (<i className="loading icon"></i>) :
      (<i className="clickable search icon" onClick={this.handleSubmit}></i>);

    // render navBar
    // TODO: make menu do stuff and not be static
    return (
      <div className="ui inverted menu" role="navigation">
        <div className="right icon menu">
          <div className="icon item">
            <i className="user icon"></i>
          </div>
          <div className="icon item">
            <i className="settings icon"></i>
          </div>
          <div className="item">
            {SearchInput({
              'handleSubmit': this.handleSubmit,
              'className': "ui small field icon input",
              'placeholder': "Search Selected...",
              'value': this.props.searchText,
              'handleChange': this.handleChange,
              'text': searchIcon,
            })}
          </div>
        </div>
      </div>
    );
  },

});
/*

      <div className="ui inverted menu" role="navigation">
        <div className="right menu">
          {navTabs}
        </div>
      </div>

      */