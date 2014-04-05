/** @jsx React.DOM */
var React = require('react');
var debug = require('debug')('views:Widgets');
var ReactBackboneMixin = require('backbone-react-component').mixin;

// TODO: make a generic widget view which wraps this + hide logic
var WidgetView = (require('../config').widgetModel === 'SC') ?
  require('./track/Track_SC') : require('./track/Track_Wave');

module.exports = React.createClass({
  
  mixins: [ReactBackboneMixin],

  render: function () {
    debug("render");
    
    // make widgetViews
    var Widgets = this.getCollection().widgets;
    var widgetViews = this.props.widgets.map(function (widget) {
      var Widget = Widgets.where({ 'soundBarId': widget.soundBarId })[0];
      return widgetView = WidgetView({
        'track': (Widget && Widget.get('track')),
        'soundBarId': widget.soundBarId,
        'index': widget.index,
        'active': (widget.index === this.props.activeWidget),
        'setActiveWidget': this.props.setActiveWidget,
        'changePlayState': this.props.changePlayState,
      });
    }.bind(this));

    return (<div>{widgetViews}</div>);
  },

});