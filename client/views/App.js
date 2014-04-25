/** @jsx React.DOM */
var debug = require('debug')('views:App')
var React = require('react');
var ReactBackboneMixin = require('backbone-react-component').mixin;

var _ = require('underscore');

var Me = require('../models/Me');
var Queue = require('../models/Queue');
var SearchResults = require('../models/SearchResults');
var Edge = require('../models/Edge');

var Tracks = require('../collections/Tracks');
var EchoNest = require('../collections/EchoNest');
var TasteProfiles = require('../collections/TasteProfiles');
var Playlists = require('../collections/Playlists');
var Edges = require('../collections/Edges');

var Site = require('./Site');
var Welcome = require('./Welcome');

module.exports = React.createClass({
  
  mixins: [ReactBackboneMixin],

  getDefaultProps: function () {
    var queue = new Queue({
      'name': 'Queue',
    }, {
      'numWidgets': 1,
    });
    var searchResults = new SearchResults({
      'name': 'Search Results',
    });
    var playlists = new Playlists([searchResults, queue], {});
    
    return {
      'model': {
        me: new Me(),
      },
      'collection': {
        'echoNest': new EchoNest(),
        'tasteProfiles': new TasteProfiles(),
        'playlists': playlists,
        'myTracks': new Tracks(),
        'edges': new Edges(),
      },
      'searchResults': searchResults,
      'appQueue':  queue,
    }
  },

  getInitialState: function () {
    return {
      'page': 'Site',
    }
  },

  changePage: function (newPage) {
    this.setState({
      'page': newPage,
    });
  },

  render: function () {
    var props = _.extend({
      'me': this.props.me,
      'changePage': this.changePage,
    }, this.props);

    // determine page to render
    var page = this.state.page;
    var renderedPage;
    switch (page) {
      case 'Welcome':
        renderedPage = Welcome(props); break;
      case 'Site':
        renderedPage = Site(props); break;
    }
    return (
      <div>
        {renderedPage}
      </div>
    );
    
  },

  componentDidMount: function () {
    this.getCollection().edges.fetch({
      'success': function (collection, response, options) {
        debug("successfully fetched edges", collection.models);
      },
    });
  },

});