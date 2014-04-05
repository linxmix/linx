/** @jsx React.DOM */
var debug = require('debug')('views:SoundBar');
var React = require('react');
var ReactBackboneMixin = require('backbone-react-component').mixin;

var Tab = require('./nav/Tab');

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
        {soundBarId: 'widget0', index: 0},
        {soundBarId: 'widget1', index: 1},
        //{soundBarId: 'widget2', index: 2},
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
    debug('asserting play state: ' + playState);
    var widgets = this.getCollection().widgets;
    var widgetModel = widgets.models[this.state.activeWidget];
    (widgetModel && widgetModel.assertPlayState(playState));
  },

  // use queue to preload widgets
  isSyncing: false,
  syncQueue: function (e, track) {
    if (this.isSyncing) { return; }
    this.isSyncing = true;

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
      var track = queue.models[queueIndex];
      var trackId = track.get('id');
      var widgetTrack = widget.get('track');
      if (trackId !== (widgetTrack && widgetTrack.get('id'))) {
        console.log("widget and track were unsynced:",
          widget.get('index'), track.get('title'));
        widget.load(track, {
          'callback': this.assertPlayState,
        });
      }

    }.bind(this));

    this.isSyncing = false;

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

    // make WidgetsView
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