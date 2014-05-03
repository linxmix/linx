/** @jsx React.DOM */
var debug = require('debug')('views:App')
var React = require('react');
var ReactBackboneMixin = require('backbone-react-component').mixin;

var _ = require('underscore');

var startPage = require('../config').startPage;

var Me = require('../models/Me');
var SearchResults = require('../models/SearchResults');
var Edge = require('../models/Edge');

var Tracks = require('../collections/Tracks');
var Transitions = require('../collections/Transitions');
var EchoNest = require('../collections/EchoNest');
var TasteProfiles = require('../collections/TasteProfiles');
var Playlists = require('../collections/Playlists');
var Mixes = require('../collections/Mixes');
var Edges = require('../collections/Edges');

var Site = require('./Site');
var Welcome = require('./Welcome');

module.exports = React.createClass({
  
  mixins: [ReactBackboneMixin],

  getDefaultProps: function () {
    var searchResults = new SearchResults();
    var playlists = new Playlists([searchResults], {});
    
    return {
      'model': {
        me: new Me(),
      },
      'collection': {
        'echoNest': new EchoNest(),
        'tasteProfiles': new TasteProfiles(),
        'playlists': playlists,
        'mixes': new Mixes(),
        'myTracks': new Tracks(),
        'transitions': new Transitions(),
      },
      'searchResults': searchResults,
    }
  },

  getInitialState: function () {
    return {
      'page': startPage,
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
    this.getCollection().transitions.fetch({
      'success': function (collection, response, options) {
        debug("successfully fetched transitions", collection.length);
        var edge1 = new Edge({
          'edgeId': '142731966',
          'in': '54740440',
          'out': '74157608',
          'endIn': 251.46558,
          'startEdge': 4.01107,
          'endEdge': 30.49882,
          'startOut': 41.77451,
        });
        //edge1.save();
      },
    });

    this.getCollection().mixes.add({});
  },

});