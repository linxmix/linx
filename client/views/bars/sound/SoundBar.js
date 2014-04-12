/** @jsx React.DOM */
var debug = require('debug')('views:bars/sound/SoundBar');
var React = require('react');
var ReactBackboneMixin = require('backbone-react-component').mixin;

var Tab = require('../nav/Tab');

var WidgetView = (require('../../../config').widgetModel === 'SC') ?
  require('../../track/Track_SC') : require('../../track/Track_Wave');

module.exports = React.createClass({
  
  mixins: [ReactBackboneMixin],

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
        'track': widget.get('track'),
        'active': active,
        // active widget in soundbar is always the playing widget
        'playing': active,
        'playState': this.props.playState,
        'onFinish': function () { playlist.forth() },
      });
    }.bind(this));

    // render SoundBar with widgets
    // TODO: add "playing {playlist name}"" as header
    return (
      <div className="inverted ui segment">
        {widgetViews}
      </div>
    )
  },

  resetListener: function (prevPlaylist) {
    // force rerender on track change
    function onChangeTrack(newTrack) {
      debug('onChangeTrack', this, newTrack);
      this.forceUpdate();
    }
    // remove handler from prevPlaylist
    if (prevPlaylist) {
      prevPlaylist.unbindQueueListener(onChangeTrack.bind(this));
    }
    // add handler to new playlist
    var playlist = this.props.playingPlaylist;
    if (playlist) {
      playlist.bindQueueListener(onChangeTrack.bind(this));
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