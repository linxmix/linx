/** @jsx React.DOM */
var React = require('react');
var debug = require('debug')('views:Search');
var ReactBackboneMixin = require('backbone-react-component').mixin;

var Tracks = require('../track/Tracks');

var Track = require('../../models/Track');

module.exports = React.createClass({
  
  mixins: [ReactBackboneMixin],

  getInitialState: function () {
    return {
      'searchText': '',
      'searchResults': [],
      'activeSearchTab': {parent: 'sc', key: 'sc-tracks', type: 'tracks', url: '/tracks', name: 'Tracks'},
      'searching': false,
    }
  },

  setActiveSearchTab: function(newActiveSearchTab) {
    this.setState({
      'activeSearchTab': newActiveSearchTab,
    });
  },

  handleUserInput: function (options) {
    this.setState({
      'searchText': options.searchText,
    });
  },

  searchSoundCloud: function (callback) {
    var tab = this.state.activeSearchTab;
    var options = {
      'q': this.state.searchText ? this.state.searchText : null,
      'filter': 'streamable', // only return results we can stream
    }
    SC.get(this.state.activeSearchTab['url'], options, callback)
  },

  searchEchoNest: function (callback) {
    var tab = this.state.activeSearchTab;
    var options = {
      'combined': this.state.searchText ? this.state.searchText : null,
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

  executeSearch: function () {
    debug("executing search", this.state.searchText);
    this.setState({ 'searching': true });

    // callback which modifies this React Class's state
    var cb = function (tracks, areModels) {
      // curry tracks into models
      if (!areModels) {
        var trackModels = tracks.map(function (track) {
          return new Track(track);
        })
      }
      this.setState({
        'searchResults': trackModels,
        'searching': false,
      });
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
    // TODO: make this NOT change until search results change!
    console.log("TRACKVIEW", 'list-' + this.state.activeSearchTab['parent']);
    return (
      <div className="ui grid">
        <div className="two wide column">
          {SearchBar({
            'searchText': this.state.searchText,
            'activeSearchTab': this.state.activeSearchTab,

            'setActiveSearchTab': this.setActiveSearchTab,
            'handleUserInput': this.handleUserInput,

            'searching': this.state.searching,
            'executeSearch': this.executeSearch,
          })}
        </div>
        <div className="fourteen wide column">
          {Tracks({
            'tracks': this.state.searchResults,
            'trackView': 'list-' + this.state.activeSearchTab['parent'],
            'changePlayState': this.props.changePlayState,
          })}
        </div>
      </div>
    );
  },

});