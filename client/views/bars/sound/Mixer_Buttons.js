/** @jsx React.DOM */
var React = require('react');
var debug = require('debug')('views:bars/sound/Mixer_Buttons');
var ReactBackboneMixin = require('backbone-react-component').mixin;

var Tab = require('../nav/Tab');

var _ = require('underscore');

module.exports = React.createClass({
  
  mixins: [ReactBackboneMixin],

  getDefaultProps: function () {
    return {
      'defaultTabs': [
        {
          key: 'back',
          icon: 'step backward icon',
          handleClick: function () { debug('back'); },
        },
        {
          key: 'play',
          icon: 'play icon',
          handleClick: function () { debug('play'); },
        },
        {
          key: 'forth',
          icon: 'step forward icon',
          handleClick: function () { debug('forth'); },
        },
      ],
      'mixerTabs': [],
      'tabs': [],
    }
  },

  render: function () {
    debug("render");
    
    // make default tabs + given mixer tabs
    var tabs = this.props.defaultTabs.concat(this.props.mixerTabs);
    var tabs = this.props.tabs.concat(tabs.map(function(tab) {
      return (
        Tab(_.extend({}, tab, {
          'name': (<i className={tab.icon}></i>),
          'inactiveClass': 'ui icon item',
          'handleClick': tab.handleClick,
        }))
      )
    // add any given tabs
    }.bind(this)));


    return (<div className="inverted ui icon menu">{tabs}</div>);
  },

});