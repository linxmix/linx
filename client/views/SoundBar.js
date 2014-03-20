/** @jsx React.DOM */
var debug = require('debug')('views:SoundBar');
var React = require('react');
var ReactBackboneMixin = require('backbone-react-component').mixin;

var Tab = require('./nav/Tab');

var WidgetModel = require('../models/Widget');
var Widgets = require('../collections/Widgets');
var WidgetsView = require('./Widgets');

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
        {id: 'widget2', index: 2},
      ],
    }
  },

  getInitialState: function () {
    return {
      activeWidget: 0,
    }
  },

  setActiveWidget: function(newWidget) {
    debug("setActiveWidget" + newWidget)
    this.setState({
      activeWidget: newWidget,
    });
  },

  assertPlayState: function () {
    var playState = this.props.playState,
        activeWidget = this.state.activeWidget,
        widget = this.getCollection().widgets.models[activeWidget].get('widget');
    debug('asserting play state: ' + playState)
    switch (playState) {
      case 'play':
        widget.play();
        break;
      case 'pause':
        widget.pause();
        break;
    }
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
          widget, track);
        widget.get('widget').load(track.get('uri'));
        // update widget with new trackId
        widget.set({ 'trackId': trackId });
      }

    // finally, make sure active widget reflects playState
    this.assertPlayState()

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
      'changePlayState': this.props.changePlayState,
    });

    // render SoundBar
    return (
      <div className="bottom-menu">
        {widgetsView}
      </div>
    );
  },

  // TODO: bind queue add and remove to fn syncQueue.

  // rendered component has been mounted to a DOM element
  componentDidMount: function () {
    debug("component mounted");

    // setup queue listeners
    var queue = this.getCollection().queue;
    queue.on('add', function (track) {
      return this.syncQueue('add', track)
    }.bind(this));
    queue.on('remove', function (track) {
      return this.syncQueue('remove', track)
    }.bind(this));
    /*function (track) {
      var index = queue.models.indexOf(track);
      debug("queuing track " + track.get('title') +
        "at index " + index);
      if (index < this.props.widgets.length) {
        widgets[index].load(track.get('uri'));
      }
    }.bind(this));*/
  },

});