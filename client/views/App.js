/** @jsx React.DOM */
var debug = require('debug')('views:App')
var React = require('react');
var ReactBackboneMixin = require('backbone-react-component').mixin;

var _ = require('underscore');

var Me = require('../models/Me');

var Queue = require('../collections/Queue');
var Widgets = require('../collections/Widgets');
var Tracks = require('../collections/Tracks');
var EchoNest = require('../collections/EchoNest');
var TasteProfiles = require('../collections/TasteProfiles');
var Playlists = require('../collections/Playlists');

var Header = require('./Header');
var Left = require('./Left');
var Main = require('./Main');
var Right = require('./Right');
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
        'tasteProfiles': new TasteProfiles(),
        'playlists': new Playlists(),
        'tracks': new Tracks(),
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
      'activePlaylist': '',
      'leftBar': 0,
      'rightBar': 0,
      'bottomBar': 0,
    }
  },

  changePage: function (newPage) {
    debug("changePage", newPage);
    this.setState({
      'page': newPage,
    });
  },

  changePlayState: function (newPlayState) {
    debug("changePlayState", newPlayState);
    this.setState({
      'playState': newPlayState,
    });
  },

  changeActivePlaylist: function (newPlaylistId) {
    debug("changeActivePlaylist", newPlaylistId);
    this.setState({
      'activePlaylist': newPlaylistId,
    });
  },

  changeBar: function (options) {
    debug("changeBar", options);
    this.setState(options);
  },

  render: function () {
    var left = this.state.leftBar;
    var right = this.state.rightBar;
    var bottom = this.state.bottomBar;
    var props = {
      'me': this.props.me,
      'playState': this.state.playState,
      'changePlayState': this.changePlayState,
      'activePlaylist': this.state.activePlaylist,
      'changeActivePlaylist': this.changeActivePlaylist,
    }

    // determine size of each section
    var middleClass = widthToString(16 - left - right)
    var leftClass = 'tight-right ' + widthToString(left);
    var rightClass = 'tight-left ' + widthToString(right);

    return (
    
      <div>
        <div className="ui grid">
          <div className="row">

            <div className={leftClass}>
              {Left(_.extend({
                'leftBar': left,
                'changeBar': this.changeBar,
              }, props))}
            </div>

            <div className={middleClass}>
              {Header(_.extend({
                'page': this.state.page,
                'changePage': this.changePage,
              }, props))}
              {Main(_.extend({
                'page': this.state.page,
                'changePage': this.changePage,
              }, props))}
              {Footer(_.extend({
                'bottomBar': bottom,
                'changeBar': this.changeBar,
              }, props))}
            </div>

            <div className={rightClass}>
              {Right(_.extend({
                'rightBar': right,
                'changeBar': this.changeBar,
              }, props))}
            </div>
            
          </div>
        </div>
      </div>
    );
    
  },

});

// converts integer to semantic ui column string
function widthToString(width) {
  switch (width) {
    case 0: return '';
    case 1: return 'column';
    case 2: return 'two wide column';
    case 12: return 'twelve wide column';
    case 13: return 'thirteen wide column';
    case 14: return 'fourteen wide column';
    case 15: return 'fifteen wide column';
    case 16: return 'sixteen wide column';
  }
}