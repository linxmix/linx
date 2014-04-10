/** @jsx React.DOM */
var React = require('react');
var debug = require('debug')('views:bars/sound/Mixer');
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
    }
  },

  // call appropriate handler on click
  handleClick: function (tab) {
    switch (tab.key) {
      case 'playpause': this.props.changePlayState(tab.handle); break;
      case 'back': this.props.back(); break;
      case 'forth': this.props.forth(); break;
      default: debug(tab.key);
    }
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
    var launchTab = this.props.launchTab
    launchTab && tabs.unshift(launchTab);

    return (<div className="inverted ui icon menu">{tabs}</div>);
  },

});