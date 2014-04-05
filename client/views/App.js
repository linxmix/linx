/** @jsx React.DOM */
var debug = require('debug')('views:App')
var React = require('react');
var ReactBackboneMixin = require('backbone-react-component').mixin;

var Me = require('../models/Me');

var Queue = require('../collections/Queue');
var Widgets = require('../collections/Widgets');
var Tracks = require('../collections/Tracks');
var EchoNest = require('../collections/EchoNest');

var Header = require('./Header');
var Main = require('./Main');
var Footer = require('./Footer');

module.exports = React.createClass({
  
  mixins: [ReactBackboneMixin],

  getDefaultProps: function () {
    return {
      'model': {
        me: new Me(),
      },
      'collection': {
        'queue': new Queue(),
        'echoNest': new EchoNest(),
        'myTracks': new Tracks(),
        // TODO: move this into soundbar?
        'widgets': new Widgets(),
      },
    };
  },

  getInitialState: function () {
    return {
      'page': 'Queue',
      'playState': 'pause',
    }
  },

  changePage: function(newPage) {
    debug("changePage", newPage)
    this.setState({
      'page': newPage,
    });
  },

  changePlayState: function(newPlayState) {
    debug("changePlayState", newPlayState)
    this.setState({
      'playState': newPlayState,
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
        <div className="ui red vertical demo sidebar menu">
          <a className="item">
            <i className="home icon"></i>
            Home
          </a>
          <a className="active item">
            <i className="heart icon"></i>
            Current Section
          </a>
          <a className="item">
            <i className="facebook icon"></i>
            Like us on Facebook
          </a>
          <div className="item">
            <b>More</b>
            <div className="menu">
              <a className="item">About</a>
              <a className="item">Contact Us</a>
            </div>
          </div>
        </div>
        <button className="sidebar toggle">toggle sidebar</button>
        {Header(props)}
        {Main(props)}
        {Footer(props)}
      </div>
    );
    
  },

  componentDidMount: function () {
    this.$('.sidebar.toggle').unbind('click');
    this.$('.sidebar.toggle').click(function () {
      this.$('.ui.sidebar').sidebar('toggle');
    }.bind(this));
  },
});