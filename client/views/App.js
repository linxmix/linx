/** @jsx React.DOM */
var debug = require('debug')('views:App')
var React = require('react');
var ReactBackboneMixin = require('backbone-react-component').mixin;

var Me = require('../models/Me');

var Tracks = require('../collections/Tracks');

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
      },
    };
  },

  getInitialState: function () {
    return {
      page: 'upNext',
      playlist: 'me',
      playState: 'stop',
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

  changePlaylist: function(newPlaylist) {
    debug("changePlaylist" + newPlaylist)
    this.setState({
      playlist: newPlaylist,
    });
  },

  render: function () {
    var props = {
      'me': this.props.me,
      'tracks': this.props.tracks,
      'page': this.state.page,
      'playState': this.state.playState,
      'playlist': this.state.playlist,
      'changePage': this.changePage,
      'changePlayState': this.changePlayState,
      'changePlaylist': this.changePlaylist,
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