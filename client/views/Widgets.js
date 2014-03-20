/** @jsx React.DOM */
var React = require('react');
var debug = require('debug')('views:Widgets');
var ReactBackboneMixin = require('backbone-react-component').mixin;

// TODO: is there a better way to write this?
var WidgetView = (require('../config').widgetModel === 'SC') ?
  require('./track/Track_SC') : require('./track/Track_Wave');

module.exports = React.createClass({
  
  mixins: [ReactBackboneMixin],

  render: function () {
    
    // make widgetViews
    var widgetViews = this.props.widgets.map(function (widget) {
      return WidgetView({
        'id': widget.id,
        'index': widget.index,
        'active': (widget.index === this.props.activeWidget),
        'playState': this.props.playState,
        'setActiveWidget': this.props.setActiveWidget,
        'changePlayState': this.props.changePlayState,
      });
    }.bind(this));

    return (<div>{widgetViews}</div>);
  },

});