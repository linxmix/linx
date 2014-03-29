/** @jsx React.DOM */
var debug = require('debug')('views:App')
var React = require('react');
var ReactBackboneMixin = require('backbone-react-component').mixin;

var Me = require('../models/Me');

var Tracks = require('../collections/Tracks');
var Queue = require('../collections/Queue');
var Widgets = require('../collections/Widgets');

var Header = require('./Header');
var Main = require('./Main');
var Footer = require('./Footer');

module.exports = React.createClass({
  
  mixins: [ReactBackboneMixin],

  getDefaultProps: function () {
    return {
      model: {
        me: new Me(),
      },
      collection: {
        tracks: new Tracks(),
        queue: new Queue(),
        // TODO: move this into soundbar?
        widgets: new Widgets(),
      },
    };
  },

  getInitialState: function () {
    return {
      page: 'upNext',
      playState: 'pause',
    }
  },

  changePage: function(newPage) {
    debug("changePage: " + newPage)
    this.setState({
      page: newPage,
    });
  },

  changePlayState: function(newPlayState) {
    debug("changePlayState: " + newPlayState)
    this.setState({
      playState: newPlayState,
    });
  },

  render: function () {
    var props = {
      'me': this.props.me,
      'page': this.state.page,
      'playState': this.state.playState,
      'changePage': this.changePage,
      'changePlayState': this.changePlayState,
    }

    return (
      <div>
        {Header(props)}
        {Main(props)}
        {Footer(props)}
      </div>
    );
    
  },
});