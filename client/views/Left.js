/** @jsx React.DOM */
var React = require('react');
var debug = require('debug')('views:Left')
var ReactBackboneMixin = require('backbone-react-component').mixin;

var _ = require('underscore');

var Tab = require('./bars/nav/Tab');

var PlaylistsBar = require('./bars/left/PlaylistsBar');
var SearchBar = require('./bars/left/SearchBar');

module.exports = React.createClass({
  
  mixins: [ReactBackboneMixin],

  getDefaultProps: function () {
    return {
      'tabs': [
        {
          key: 'search',
          name: 'Search',
          icon: 'search icon',
          className: '.search-sidebar'
        },
        {
          key: 'playlists',
          name: 'Playlists',
          icon: 'list layout icon',
          className: '.playlist-sidebar'
        },
      ],
    }
  },

  getInitialState: function () {
    return {
      'activeTab': 'search',
    }
  },

  tabClick: function (tab) {
    this.$(tab.className).sidebar('toggle');
    this.setState({
      'activeTab': tab.key,
    });
  },

  render: function () {

    // make tabs
    var tabs = this.props.tabs.map(function(tab) {
      return (
        Tab(_.extend({}, tab, {
          'active': (tab.key == this.state.activeTab),
          'name': (<i className={tab.icon}></i>),
          'activeClass': 'purple ui icon button',
          'inactiveClass': 'black ui icon button',
          'handleClick': this.tabClick,
        }))
      )
    }.bind(this));
    
    return (
      <div>
        <div className="left-sidebar">
          <div className="ui vertical buttons">
            {tabs}
          </div>
        </div>
        {SearchBar(_.extend({
          'className': 'search-sidebar',
        },this.props))}
        {PlaylistsBar(_.extend({
          'className': 'playlist-sidebar',
        },this.props))}
      </div>
    );
  },

});