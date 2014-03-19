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
    var appQueue = new Tracks();
    return {
      model: {
        me: new Me(),
      },
      collection: {
        tracks: new Tracks(),
        queue: appQueue,
      },
    };
  },

  getInitialState: function () {
    return {
      page: 'upNext',
      playlist: 'me',
      playState: 'pause',
      widget: 0,
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

  changeWidget: function(newWidget) {
    debug("changeWidget" + newWidget)
    this.setState({
      widget: newWidget,
    });
  },

  render: function () {
    var props = {
      'me': this.props.me,
      'tracks': this.props.tracks,
      'queue': this.props.queue,
      'page': this.state.page,
      'playState': this.state.playState,
      'playlist': this.state.playlist,
      'widget': this.state.widget,
      'changePage': this.changePage,
      'changePlayState': this.changePlayState,
      'changePlaylist': this.changePlaylist,
      'changeWidget': this.changeWidget,
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