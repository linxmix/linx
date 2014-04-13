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
        /*{
          key: 'search',
          name: 'Search',
          icon: 'search icon',
          className: '.search-sidebar'
        },*/
        {
          key: 'playlists',
          name: 'Playlists',
          icon: 'list layout icon',
          className: '.playlist-sidebar'
        },
        {
          key: 'linx-map',
          name: 'LinxMap',
          icon: 'globe icon',
          className: '.linxMap-sidebar'
        },
      ],
    }
  },

  getInitialState: function () {
    return {
      'activeTab': this.props.tabs[0],
      'sidebarClosed': true,
    }
  },

  launchTabClick: function (launchTab) {
    this.tabClick(this.state.activeTab);
  },

  tabClick: function (tab) {
    var selector = tab.className;
    this.$(selector).sidebar({
      'exclusive': true,
    });
    // toggle tab's sidebar
    this.$(selector).sidebar('toggle');
    // set tab as active and report if sidebar is closed
    this.setState({
      'activeTab': tab,
      'sidebarClosed': this.$(selector).sidebar('is closed'),
    });
  },

  render: function () {

    // make launchTab
    var isHidden = this.state.sidebarClosed;
    var launchTabName = (isHidden) ? (<i className="right arrow icon"></i>) :
      (<i className="left arrow icon"></i>);
    var launchTab = Tab({
      'name': launchTabName,
      'active': isHidden,
      'activeClass': 'black ui icon active item',
      'inactiveClass': 'black ui button icon item',
      'handleClick': this.launchTabClick,
    });

    // make tabs
    var tabs = this.props.tabs.map(function(tab) {
      var active = (tab.key == this.state.activeTab.key);
      var name = active ? (<i className={'purple ' + tab.icon}></i>) :
        (<i className={tab.icon}></i>);
      return (
        Tab(_.extend({}, tab, {
          'name': name,
          'inactiveClass': 'icon item',
          'handleClick': this.tabClick,
        }))
      )
    }.bind(this));
    // add launchTab
    tabs.unshift(launchTab);

    return (
      <div>
        <div className="left-sidebar">
          <div className="inverted ui vertical icon menu">
            {tabs}
          </div>
        </div>
        {PlaylistsBar(_.extend({
          'className': 'playlist-sidebar',
        },this.props))}
      </div>
    );
  },

});