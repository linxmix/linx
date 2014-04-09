/** @jsx React.DOM */
var React = require('react');
var debug = require('debug')('views:bars/sound/SoundBar_Collapse');
var ReactBackboneMixin = require('backbone-react-component').mixin;

var Tab = require('../nav/Tab');

var _ = require('underscore');

module.exports = React.createClass({
  
  mixins: [ReactBackboneMixin],

  getDefaultProps: function () {
    return {
      'tabs': [
        {
          key: 'back',
          icon: 'step backward icon',
        },
        {
          key: 'playpause',
          icon: 'play icon',
        },
        {
          key: 'forth',
          icon: 'step forward icon',
        },
      ],
      'handlers': null,
    }
  },

  // call appropriate handler on click
  handleClick: function (tab) {
    this.props.handlers[tab.key](tab.handle);
  },

  render: function () {
    debug("PLAYSTATE", this.props.playState);
    var tabs = this.props.tabs;

    // update playpause button
    var playing = (this.props.playState === 'play');
    var playpause = _.extend(tabs[1], {
      'handle': playing ? 'pause' : 'play',
    });
    playpause['icon'] = playpause.handle + ' icon';
    tabs[1] = playpause;

    // make mixer tabs
    tabs = tabs.map(function(tab) {
      return (
        Tab(_.extend({}, tab, {
          'name': (<i className={tab.icon}></i>),
          'inactiveClass': 'ui icon item',
          'handleClick': this.handleClick,
        }))
      )
    }.bind(this));
    // add given launchTab
    tabs.unshift(this.props.launchTab);
    console.log(tabs);


    return (<div className="inverted ui icon menu">{tabs}</div>);
  },

});