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
    var widgets = playlist.getWidgets();
    
    // make widgetViews
    var widgetViews = widgets.map(function (widget) {;
      return WidgetView({
        'widget': widget,
        'active': widget.get('isActive'),
      });
    }.bind(this));

    // render SoundBar
    // TODO: add playlist name as header
    return (
      <div className="inverted ui segment">
        {widgetViews}
      </div>
    )
  },

});