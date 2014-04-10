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

    // get widgets from playingPlaylist
    var widgets = playlist.getWidgets();
    var activeWidget = widgets.activeWidget;
    
    // make widgetViews from widgets
    var widgetViews = widgets.map(function (widget) {;
      return WidgetView({
        'widget': widget,
        'track': widget.get('track'),
        'active': widget.get('index') === activeWidget,
      });
    }.bind(this));

    // render SoundBar with widgets
    // TODO: add playlist name as header
    return (
      <div className="inverted ui segment">
        {widgetViews}
      </div>
    )
  },

});