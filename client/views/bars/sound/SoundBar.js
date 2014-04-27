/** @jsx React.DOM */
var debug = require('debug')('views:bars/sound/SoundBar');
var React = require('react');
var ReactBackboneMixin = require('backbone-react-component').mixin;

var Tab = require('../nav/Tab');

var WidgetView = (require('../../../config').widgetModel === 'SC') ?
  require('../../track/Track_SC') : require('../../track/Track_Wave');

module.exports = React.createClass({
  
  mixins: [ReactBackboneMixin],

  onLoadStart: function () {
    this.props.setLoading(true);
  },

  onLoadEnd: function () {
    this.props.setLoading(false);
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
        'onLoadStart': this.onLoadStart,
        'onLoadEnd': this.onLoadEnd,
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

  resetListener: function (prevPlaylist) {
    // remove handler from prevPlaylist
    if (prevPlaylist && this.onCycle) {
      prevPlaylist.offCycle(this.onCycle);
    }
    // force rerender on track change
    var onCycle = this.onCycle || function onCycle(newTrack) {
      debug('onCycle', this, newTrack);
      this.forceUpdate();
    }.bind(this);
    // add handler to new playlist
    var playlist = this.props.playingPlaylist;
    if (playlist) {
      playlist.onCycle(onCycle);
    }
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

});