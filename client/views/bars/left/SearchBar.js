/** @jsx React.DOM */
var React = require('react');
var debug = require('debug')('views:Search');
var ReactBackboneMixin = require('backbone-react-component').mixin;

var _ = require('underscore');

var Tab = require('../nav/Tab');

var Tracks = require('../../../collections/Tracks');

var SearchInput = require('../nav/SearchInput');

var Playlist = require('../../../models/Playlist');

module.exports = React.createClass({
  
  mixins: [ReactBackboneMixin],

  getInitialState: function () {
    return {
      'activeSearchTab': {parent: 'sc', key: 'sc-tracks', type: 'tracks', url: '/tracks', name: 'Tracks'},
      'searching': false,
    }
  },

  getDefaultProps: function() {
    return {
      Tabs_SC: [
        {parent: 'sc', key: 'sc-tracks', type: 'tracks', url: '/tracks', name: 'Tracks'},
        {parent: 'sc', key: 'sc-playlists', type: 'playlists', url: '/playlists', name: 'Playlists'},
        {parent: 'sc', key: 'sc-users', type: 'users', url: '/users', name: 'Users'},
        // TODO: users, groups, playlists
      ],
      Tabs_Echo: [
        {parent: 'echo', key: 'echo-songs', type: 'songs', url: 'song/search', name: 'Songs'},
        {parent: 'echo', key: 'echo-playlists', type: 'playlists', url: 'playlist/search', name: 'Playlists'},
        {parent: 'echo', key: 'echo-genres', type: 'genres', url: 'playlist/search', name: 'Artists'},
        {parent: 'echo', key: 'echo-artists', type: 'artists', url: 'playlist/search', name: 'Genres'},
        // TODO: genres, artists, playlists
      ],
    };
  },

  handleChange: function (options) {
    this.props.setSearchBarText(options.searchText);
  },

  setActiveSearchTab: function(newActiveSearchTab) {
    this.setState({
      'activeSearchTab': newActiveSearchTab,
    });
  },

  searchSoundCloud: function (callback) {
    var tab = this.state.activeSearchTab;
    var options = {
      'q': this.props.searchBarText ? this.props.searchBarText : null,
      'filter': 'streamable', // only return results we can stream
    }
    SC.get(this.state.activeSearchTab['url'], options, callback)
  },

  searchEchoNest: function (callback) {
    var tab = this.state.activeSearchTab;
    var options = {
      'combined': this.props.searchBarText ? this.props.searchBarText : null,
    }
    this.getCollection().echoNest.search({
      'url': tab['url'],
      'query': options,
      // have to read response since collection's models are async
      'success': function (collection, response, options) {
        var tracks;
        switch (tab['type']) {
          case 'songs':
            tracks = response.response.songs; break;
          default:
            debug("WARNING: unknown tab['type']", tab['type']);
        }
        callback(tracks);
      },
    });
  },

  executeSearch: function (e) {
    var searchText = this.props.searchBarText;
    debug("executing search", searchText);
    this.setState({ 'searching': true });

    // callback which modifies this React Class's state
    var cb = function (tracks, areModels) {
      // make playlist from results
      var playlist = new Playlist({
        'name': 'Searched: ' + this.props.searchBarText,
        'tracks': new Tracks(tracks),
      })
      // update our state
      this.setState({
        'searching': false,
      });
      this.props.setActivePlaylist(playlist);
    }.bind(this);

    // determine which source to search
    var tab = this.state.activeSearchTab;
    switch (tab['parent']) {
      case 'sc':
        this.searchSoundCloud(cb); break;
      case 'echo':
        this.searchEchoNest(cb); break;
      default:
        debug("WARNING: unknown activeSearchParent", tab['parent']);
    }
  },

  render: function () {

    // make SC tabs
    var tabs_SC = this.props.Tabs_SC.map(function(tab) {
      return (
        Tab(_.extend({
          'active': (tab.key === this.state.activeSearchTab.key),
          'activeClass': 'active item',
          'inactiveClass': 'item',
          'handleClick': this.setActiveSearchTab,
        }, tab))
      )
    }.bind(this));

    // make EchoNest tabs
    var tabs_Echo = this.props.Tabs_Echo.map(function(tab) {
      return (
        Tab(_.extend({
          'active': (tab.key === this.state.activeSearchTab.key),
          'activeClass': 'active item',
          'inactiveClass': 'item',
          'handleClick': this.setActiveSearchTab,
        }, tab))
      )
    }.bind(this));

    // determine searching icon
    var searchIcon, activeIcon;
    if (this.state.searching) {
      // need 2 separate because cant have duplicate react element
      searchIcon = (<i className="loading icon"></i>);
      activeIcon = (<i className="loading icon"></i>);
    } else {
      searchIcon = (<i className="clickable search icon" onClick={this.executeSearch}></i>);
      activeIcon = (<i className="clickable search icon" onClick={this.executeSearch}></i>);
    }

    // place active icon for active parent
    var tab = this.state.activeSearchTab;
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

    var className = "ui vertical inverted sidebar menu " +
      this.props.className;
    return (
      <div className={className}>
        <div className="header item">Search</div>
        <div className="item">
          {SearchInput({
            'handleSubmit': this.executeSearch,
            'className': "ui small field icon input",
            'placeholder': "Search Selected...",
            'value': this.props.searchBarText,
            'handleChange': this.handleChange,
            'text': searchIcon,
          })}
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

/*
  render: function () {
    // TODO: make this NOT change until search results change!
    console.log("TRACKVIEW", 'list-' + this.state.activeSearchTab['parent']);
    return (
      <div>
        {SearchBar({
          'searchText': this.props.searchBarText,
          'activeSearchTab': this.state.activeSearchTab,

          'setActiveSearchTab': this.setActiveSearchTab,
          'handleUserInput': this.handleUserInput,

          'searching': this.state.searching,
          'executeSearch': this.executeSearch,
        })}
      </div>
    );
  },
*/