/** @jsx React.DOM */
var React = require('react');
var ReactBackboneMixin = require('backbone-react-component').mixin;

var Connect = require('./Connect');
var Tab = require('./Tab');

module.exports = React.createClass({
  
  mixins: [ReactBackboneMixin],

  getDefaultProps: function() {
    return {
      'navTabs': ['Me', 'TasteProfiles', 'Playlists', 'Mixes', 'Queue'],
    };
  },

  handleClick: function(navTab) {
    this.props.changePage(navTab.key);
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
    return (
      <div className="ui inverted menu" role="navigation">
        <a className="header item">Linx</a>
        {navTabs}
        <div className="right menu">
          <Connect me={this.props.me} />
        </div>
      </div>
    );
  },

});