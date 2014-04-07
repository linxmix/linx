/** @jsx React.DOM */
var React = require('react');
var debug = require('debug')('views:Left')
var ReactBackboneMixin = require('backbone-react-component').mixin;

var Tab = require('./bars/nav/Tab');

var PlaylistBar = require('./bars/left/PlaylistBar');
var Search = require('./bars/left/Search');

module.exports = React.createClass({
  
  mixins: [ReactBackboneMixin],

  getDefaultProps: function () {
    return {
      'tabs': [
        {
          key: 'playlists',
          name: 'Playlists',
          icon: 'list layout icon',
        },
        {
          key: 'search',
          name: 'Search',
          icon: 'search icon',
        },
      ],
    }
  },

  getInitialState: function () {
    return {
      'activeTab': '',
    }
  },

  changeTab: function (tabKey) {
    this.setState({
      'activeTab': tabKey,
    });
  },

  toggleBar: function (tabKey) {
    this.props.changeBar({
      'leftBar': (this.props.leftBar) ? 0 : 2,
    });
    this.changeTab(tabKey);
  },

  // TODO: fix this logic
  tabClick: function (tab) {
    console.log("TAB CLICK", tab.key, this.state.activeTab);
    // if this tab is active, toggle bar closed
    if (this.state.activeTab == tab.key) {
      this.toggleBar('');
    // if this tab is not active
    } else {
      // and bar is open, switch tabs
      if (this.state.leftBar) {
        this.changeTab(tab.key);
      // else if bar is closed, toggle bar and set active tab
      } else {
        this.toggleBar(tab.key);
      }
    }
  },

  render: function () {

    // make tabs
    var tabs = this.props.tabs.map(function(tab) {
      return (
        Tab({
          // a tab can only be active if bar is active
          'active': (this.props.leftBar &&
            (tab.key == this.state.activeTab)),
          'key': tab.key,
          'name': (<i className={tab.icon}></i>),
          'activeClass': 'active red item',
          'inactiveClass': 'blue item',
          'handleClick': this.tabClick,
        })
      )
    }.bind(this));

    // determine which bar to render based on active tab
    var bar;
    switch (this.state.activeTab) {
      case 'playlists':
        bar = PlaylistBar(this.props); break;
      case 'search':
        bar = Search(this.props); break;
      case '':
        bar = (<div></div>); break;
      default:
        debug("warning, unknown tab", this.state.activeTab);
    }

    // determine if bar should be hidden
    var hidden = (this.props.leftBar) ? '' : 'hidden';
    return (
      <div>
        <div className="left-sidebar">
          <div className="ui vertical icon menu">
            {tabs}
          </div>
        </div>
        <div className={hidden}>
          {bar}
        </div>
      </div>
    );
  },

});

/*
            <a className="ui small black circular icon button"

{PlaylistBar({
            'activeTab': this.state.activeTab,
            'changeTab': this.changeTab,
          })}
          */