/** @jsx React.DOM */
var debug = require('debug')('views:SoundBar');
var React = require('react');
var ReactBackboneMixin = require('backbone-react-component').mixin;

var Tab = require('./nav/Tab');

var WidgetModel = require('../models/Widget');
var Widgets = require('../collections/Widgets');
var WidgetsView = require('./Widgets');


// TODO: make soundbar not cover main section
module.exports = React.createClass({
  
  mixins: [ReactBackboneMixin],

  handleClick: function (soundTab) {
    this.props.changePlayState(soundTab.key);
  },

  getDefaultProps: function () {
    return {
      soundTabs: [
        {key: 'play', name: 'Play'},
        {key: 'pause', name: 'Pause'},
      ],
      widgets: [
        {id: 'widget0', index: 0},
        {id: 'widget1', index: 1},
        //{id: 'widget2', index: 2},
      ],
    }
  },

  getInitialState: function () {
    return {
      activeWidget: 0,
    }
  },

  setActiveWidget: function (newWidget) {
    debug("setActiveWidget: " + newWidget);
    this.setState({
      activeWidget: newWidget,
    });
  },

  assertPlayState: function () {
    var playState = this.props.playState;
    var activeWidget = this.state.activeWidget;
    var widget = this.getCollection().widgets.models[activeWidget].get('widget');
    debug('asserting play state: ' + playState);
    widget.isPaused(function (isPaused) {
      console.log("widget isPaused: ", isPaused);
      if (isPaused) {
        if (playState === 'play') {
          widget.play();
        }
      } else { // widget is playing
        if (playState === 'pause') {
          widget.pause();
        }
      }
    });
  },

  // use queue to preload widgets
  syncQueue: function (e, track) {
    debug("syncQueue called");
    console.log(e, track);
    var activeWidget = this.state.activeWidget,
        collections = this.getCollection(),
        queue = collections.queue,
        widgets = collections.widgets;

    // make sure each widget has correct track loaded
    widgets.forEach(function (widget) {
      var widgetIndex = widget.get('index'),
          queueIndex = (widgetIndex + activeWidget) %
            widgets.length;

      // quit if queue index is beyond queue
      if (queueIndex >= queue.length) { return; }

      // if incorrect track, load correct track
      var track = queue.models[queueIndex],
          trackId = track.get('id');
      if (trackId !== widget.get('trackId')) {
        console.log("widget and track were unsynced:",
          widget.get('index'), track.get('title'));
        widget.load(track, {
          'callback': this.assertPlayState,
        });
      }

    }.bind(this));

  },

  render: function () {

    // make soundTabs
    var soundTabs = this.props.soundTabs.map(function(soundTab) {
      return (
        Tab({
          'active': (soundTab.key === this.props.playState),
          'key': soundTab.key,
          'name': soundTab.name,
          'activeClass': 'active item',
          'inactiveClass': 'item',
          'handleClick': this.handleClick,
        })
      )
    }.bind(this));

    // make WidgetsWiew
    var widgetsView = WidgetsView({
      'widgets': this.props.widgets,
      'activeWidget': this.state.activeWidget,
      'setActiveWidget': this.setActiveWidget,
      'playState': this.props.playState,
      'changePlayState': this.props.changePlayState,
    });

    // render SoundBar
    return (
      <div className="bottom-menu">
        {widgetsView}
      </div>
    );
  },

  // rendered component has been mounted to a DOM element
  componentDidMount: function () {
    debug("component mounted");

    // setup queue listeners
    var queue = this.getCollection().queue;
    queue.on('add', function (track) {
      this.assertPlayState();
      return this.syncQueue('add', track)
    }.bind(this));
    queue.on('remove', function (track) {
      this.assertPlayState();
      return this.syncQueue('remove', track)
    }.bind(this));
  },

});