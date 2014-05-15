/** @jsx React.DOM */
var React = require('react');
var ReactBackboneMixin = require('backbone-react-component').mixin;
var debug = require('debug')('views:bars/nav/NavBar');

var _ = require('underscore');

var Tab = require('./Tab');
var SearchInput = require('./SearchInput');

module.exports = React.createClass({
  
  mixins: [ReactBackboneMixin],

  getDefaultProps: function () {
    return {
      // TODO: show icon and label on hover
      'navTabs': [
        {
          'key': 'settings',
          'icon': 'settings icon',
          'color': 'green',
          'iconText': 'Settings',
          'cb': function () {},
        },
        {
          'key': 'profile',
          'icon': 'user icon',
          'color': 'purple',
          'iconText': 'Profile',
          'cb': function () {},
        },
        {
          'key': 'upload',
          'icon': 'cloud upload icon',
          'color': 'orange',
          'iconText': 'Upload',
          'cb': function (navTab) {
            this.props.changePage('Uploader');
          },
        },
        {
          'key': 'linxMap',
          'icon': 'globe icon',
          'color': 'teal',
          'iconText': 'Linx Map',
          'cb': function (navTab) {
            this.props.changePage('LinxMap');
          },
        },
      ]
    }
  },

  getInitialState: function () {
    return {
      'searching': false,
      'hoveredTab': null, 
    }
  },

  handleClick: function(navTab) {
    // call tab's callback, if has one
    var cb = navTab.cb;
    cb && cb.call(this, navTab);
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

  onMouseEnter: function(e, navTab) {
    this.setState({
      'hoveredTab': navTab,
    });
  },

  onMouseLeave: function(e, navTab) {
    this.setState({
      'hoveredTab': null,
    });
  },

  render: function () {
    var sidebarClosed = this.props.sidebarClosed;
    var hoveredTab = this.state.hoveredTab;

    // TODO: make linx logo art
    // TODO: make this work
    // TODO: also make labeled button on hover
    // add labels if sidebar is open
    // add header if sidebar is open
    var navBarClass = '';
    var header;
    if (!sidebarClosed) {
      navBarClass += ' labeled';
      header = (<div className="item">
        <p className="ui small green block header">
          Linx
        </p>
      </div>);
    }

    // make navTabs
    var navTabs = this.props.navTabs.map(function(navTab) {
      var icon = navTab.icon;
      // TODO: make icon large but dont change toolbar size
      // color icon if hovered or if uploader page
      if ((hoveredTab && (hoveredTab.key === navTab.key)) ||
        (navTab.key === 'upload' && this.props.page === 'Uploader') ||
        (navTab.key === 'linxMap' && this.props.page === 'LinxMap')) {
        icon += ' ' + navTab.color;
      }
      icon = (<i className={icon}></i>);
      return Tab(_.extend({}, navTab, {
        'inactiveClass': 'icon item',
        // add text if sidebar is open
        'name': icon,
        //'html': icon,
        'type': 'div',
        'onMouseEnter': this.onMouseEnter,
        'onMouseLeave': this.onMouseLeave,
        'handleClick': this.handleClick,
      }));
    }.bind(this));

    // determine searching icon
    var searchIcon = (this.state.searching) ?
      (<i className="orange loading search icon"></i>) :
      (<i className="clickable search icon" onClick={this.handleSubmit}></i>);

    // render navBar
    return (
      <div className="ui inverted transp icon menu" role="navigation">
        {header}
        {navTabs}
        <div className="input item">
          {SearchInput({
            'handleSubmit': this.handleSubmit,
            'className': "ui small input field icon",
            'placeholder': "Search SoundCloud...",
            'value': this.props.searchText,
            'handleChange': this.handleChange,
            'text': searchIcon,
          })}
        </div>
      </div>
    );
  },

});