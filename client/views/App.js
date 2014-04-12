/** @jsx React.DOM */
var debug = require('debug')('views:App')
var React = require('react');
var ReactBackboneMixin = require('backbone-react-component').mixin;

var _ = require('underscore');

var Me = require('../models/Me');
var Tracks = require('../collections/Tracks');

var Site = require('./Site');
var Welcome = require('./Welcome');

module.exports = React.createClass({
  
  mixins: [ReactBackboneMixin],

  getDefaultProps: function () {
    return {
      'model': {
        me: new Me(),
      },
      'myTracks': new Tracks(),
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
    var page = this.state.page;
    var props = {
      'me': this.props.me,
      'myTracks': this.props.myTracks,
      'changePage': this.changePage,
    }
    var renderedPage;
    switch (page) {
      case 'Welcome': renderedPage = Welcome(props); break;
      case 'Site': renderedPage = Site(props); break;
    }
    return (
      <div>
        {renderedPage}
      </div>
    );
    
  },

});