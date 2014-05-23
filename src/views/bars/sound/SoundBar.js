/** @jsx React.DOM */
var debug = require('debug')('views:bars/sound/SoundBar');
var React = require('react');
var Backbone = require('backbone');
var ReactBackboneMixin = require('backbone-react-component').mixin;

var _ = require('underscore');

var Tab = require('../nav/Tab');

var WidgetView = (require('../../../config').widgetModel === 'SC') ?
  require('../../track/Track_SC') : require('../../track/Track_Wave');

module.exports = React.createClass({
  
  mixins: [ReactBackboneMixin],

  getDefaultProps: function () {
    return {
      'listener': _.extend({}, Backbone.Events),
    }
  },

  onLoadStart: function (widget) {
    if (!this.props.hasLoaded) {
      this.props.toggleBar(2);
    }
    this.props.setLoading(true);
  },

  onLoadEnd: function (widget) {
    this.props.setLoading(false);
  },

  onLoadError: function (err, widget) {
    debug("LOAD ERROR", err);
    var track = widget.get('track');
    var playlist = this.props.playingPlaylist;
    this.props.setLoading(false);
    alert("We're sorry, but for some reason SoundCloud won't let us stream "+track.get('title')+ "! Try another.");
    widget.set({ 'loading': false });
    track.destroy();
  },

  onFinish: function () {
    this.props.playingPlaylist.forth();
  },

  render: function () {
    var playlist = this.props.playingPlaylist;
    if (!playlist) { return (<div></div>); }

    // get widgets from playlist
    var widgets = playlist.getWidgets();
    var activeWidget = widgets.activeWidget;
    
    // make widgetViews from widgets
    var widgetViews = widgets.map(function (widget) {;
      var active = (widget.get('index') === activeWidget);
      return WidgetView({
        'widget': widget,
        'active': active,
        // active widget in soundbar is always the playing widget
        'playing': active,
        'playState': this.props.playState,
        'masterVol': this.props.masterVol,
        'onLoadStart': this.onLoadStart,
        'onLoadEnd': this.onLoadEnd,
        'onLoadError': this.onLoadError,
        'onFinish': this.onFinish,
      });
    }.bind(this));

    // render SoundBar with widgets
    // TODO: add "playing {playlist name}"" as header
    return (
      <div className="inverted transp ui segment">
        {widgetViews}
      </div>
    )
  },

  listenTo: function (playlist) {
    if (playlist) {
      var listener = this.props.listener;
      var queue = playlist.get('queue');
      // need to wrap so calls with no args
      var forceUpdate = function () {
        this.forceUpdate();
      }.bind(this);
      listener.listenTo(queue, 'cycle',
        forceUpdate);
    }
  },

  stopListening: function (playlist) {
    if (playlist) {
      var queue = playlist.get('queue');
      this.props.listener.stopListening(queue);
    }
  },

  resetListener: function (prevPlaylist) {
    this.stopListening(prevPlaylist);
    this.listenTo(this.props.playingPlaylist);
  },

  componentDidMount: function () {
    this.resetListener();
  },

  componentDidUpdate: function (prevProps, prevState) {
    var prevPlaylist = prevProps.playingPlaylist;
    var playlist = this.props.playingPlaylist;
    // switch playlist listener if playlist changed
    if (playlist && ((prevPlaylist && prevPlaylist.cid) !== playlist.cid)) {
      this.resetListener(prevPlaylist);
    }
  },

  componentWillUnmount: function () {
    this.stopListening(this.props.playingPlaylist);
  },

});