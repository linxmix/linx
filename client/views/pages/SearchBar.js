/** @jsx React.DOM */
var React = require('react');
var debug = require('debug')('views:SearchBar');
var ReactBackboneMixin = require('backbone-react-component').mixin;

var _ = require('underscore');

var Tab = require('../nav/Tab');

module.exports = React.createClass({
  
  mixins: [ReactBackboneMixin],

  getDefaultProps: function() {
    return {
      Tabs_SC: [
        {parent: 'sc', key: 'sc-tracks', type: 'tracks', url: '/tracks', name: 'Tracks'},
        //{parent: 'sc', key: 'sc-playlists', type: 'playlists', url: '/playlists', name: 'Playlists'},
        // TODO: users, groups, playlists
      ],
      Tabs_Echo: [
        {parent: 'echo', key: 'echo-songs', type: 'songs', url: 'song/search', name: 'Songs'},
        ///{parent: 'echo', key: 'echo-playlists', type: 'playlists', url: 'playlist/search', name: 'Playlists'},
        // TODO: genres, artists, playlists
      ],
    };
  },

  handleSubmit: function () {
    this.props.executeSearch();
    // prevent default form submission behaviour
    return false;
  },

  handleChange: function () {
    this.props.handleUserInput({
      'searchText':
        this.refs.searchText.getDOMNode().value,
    });
  },

  render: function () {

    // make SC tabs
    var tabs_SC = this.props.Tabs_SC.map(function(tab) {
      return (
        Tab(_.extend({
          'active': (tab.key === this.props.activeSearchTab.key),
          'activeClass': 'active item',
          'inactiveClass': 'item',
          'handleClick': this.props.setActiveSearchTab,
        }, tab))
      )
    }.bind(this));

    // make EchoNest tabs
    var tabs_Echo = this.props.Tabs_Echo.map(function(tab) {
      return (
        Tab(_.extend({
          'active': (tab.key === this.props.activeSearchTab.key),
          'activeClass': 'active item',
          'inactiveClass': 'item',
          'handleClick': this.props.setActiveSearchTab,
        }, tab))
      )
    }.bind(this));

    // determine searching icon
    var searchIcon, activeIcon;
    if (this.props.searching) {
      // need 2 separate because cant have duplicate react element
      searchIcon = (<i className="loading icon"></i>);
      activeIcon = (<i className="loading icon"></i>);
    } else {
      searchIcon = (<i className="clickable search icon" onClick={this.handleSubmit}></i>);
      activeIcon = (<i className="clickable search icon" onClick={this.handleSubmit}></i>);
    }

    // place active icon for active parent
    var tab = this.props.activeSearchTab;
    var SoundCloudIcon = (<i></i>);
    var EchoNestIcon = (<i></i>);
    switch (tab['parent']) {
      case 'sc':
        SoundCloudIcon = activeIcon; break;
      case 'echo':
        EchoNestIcon = activeIcon; break;
      default:
        debug("WARNING: unknown activeSearchParent", tab['parent']);
    }

    return (
      <div className="ui inverted vertical menu">
        <div className="item">
          <form onSubmit={this.handleSubmit}>
            <div className="ui small field icon input">
              <input
                type="text"
                placeholder="Search Selected..."
                value={this.props.searchText}
                ref="searchText"
                autofocus
                onChange={this.handleChange}>
                {searchIcon}
              </input>
            </div>
          </form>
        </div>
        <div className="ui inverted orange segment">
          <div className="bold item">
            {SoundCloudIcon}
            Search SoundCloud
          </div>
          <div className="header menu item">
            {tabs_SC}
          </div>
        </div>
        <div className="ui inverted purple segment">
          <div className="bold item">
            {EchoNestIcon}
            Search EchoNest
          </div>
          <div className="header menu item">
            {tabs_Echo}
          </div>
        </div>
      </div>
    );
  },

});

/* TODO
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
*/