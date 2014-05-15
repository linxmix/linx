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
          className: 'search-sidebar'
        },*/
        {
          key: 'playlists',
          name: 'Playlists',
          icon: 'list layout icon',
          className: 'playlist-sidebar',
          popupClass: 'playlist-popup'
        },
        /*{
          key: 'linx-map',
          name: 'Linx Map',
          icon: 'globe icon',
          className: 'linxMap-sidebar'
          popupClass: 'linxMap-popup'
        },*/
      ],
    }
  },

  getInitialState: function () {
    return {
      'activeTab': this.props.tabs[0],
    }
  },

  launchTabClick: function (launchTab, e) {
    this.tabClick(this.state.activeTab, e);
  },

  tabClick: function (tab, e) {
    var selector = '.' + tab.className;
    this.$(selector).sidebar({
      'exclusive': true,
    });
    // toggle tab's sidebar
    this.$(selector).sidebar('toggle');
    // set tab as active
    this.setState({
      'activeTab': tab,
    });
    // report if sidebar is closed
    this.props.setSidebarClosed(
      this.$(selector).sidebar('is closed'));
  },

  // open sidebar on dragEnter
  onDragEnter: function (tab, e) {
    if (this.props.sidebarClosed) {
      // if launchTab, do launchTabClick
      if (tab.key === 'launchTab') {
        this.launchTabClick(tab, e);
      // otherwise do tab click
      } else {
        this.tabClick(tab, e);
      }
    // if sidebar is open and tab is not active, open tab
    } else if (tab.key !== this.state.activeTab.key) {
      this.tabClick(tab, e);
    }
  },

  render: function () {

    // make launchTab
    var isHidden = this.props.sidebarClosed;
    var launchTabName = (isHidden) ? (<i className="right arrow icon"></i>) :
      (<i className="left arrow icon"></i>);
    var launchTab = Tab({
      'key': 'launchTab',
      'name': launchTabName,
      'active': isHidden,
      'activeClass': 'black ui icon active item',
      'inactiveClass': 'black ui button icon item',
      'handleClick': this.launchTabClick,
    });

    // make tabs
    var tabs = this.props.tabs.map(function(tab) {
      var active = (tab.key === this.state.activeTab.key);
      var iconClass = tab.icon;
      if (active) { iconClass += ' purple' }
      return (
        Tab(_.extend({}, tab, {
          'name': (<i className={iconClass}></i>),
          'inactiveClass': 'icon item ' + tab.popupClass,
          'onDragEnter': this.onDragEnter,
          'handleClick': this.tabClick,
        }))
      )
    }.bind(this));
    // add launchTab
    tabs.unshift(launchTab);

    return (
      <div>
        <div className="semi-transparent left-sidebar">
          <div className="inverted ui vertical icon menu">
            {tabs}
          </div>
        </div>
        {PlaylistsBar(_.extend({
          'className': 'playlist-sidebar transp',
        },this.props))}
      </div>
    );
  },

  componentDidMount: function () {
    // initialize popups for tabs
    this.props.tabs.map(function (tab) {
      var selector = '.' + tab.popupClass;
      this.$(selector).popup({
        'content': tab.name,
        'position': "right center",
        'variation': "large",
        'inline': true,
        'delay': 0,
        'duration': 150,
        'closable': true,
        'preserve': true,
        'on': 'hover',
      });
    }.bind(this));
    // start sidebar as open
    this.launchTabClick();
  },

});