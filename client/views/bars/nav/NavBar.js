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
    };
  },

  getInitialState: function () {
    return {
      'searchText': '',
    }
  },

  handleClick: function(navTab) {
    this.props.changePage(navTab.key);
  },

  handleChange: function (options) {
    this.setState({
      'searchText': options.searchText,
    });
  },

  handleSubmit: function () {
    this.props.setSearchBarText(this.state.searchText)
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
              'value': this.state.searchText,
              'handleChange': this.handleChange,
              'text': (<i className="clickable search icon"></i>),
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