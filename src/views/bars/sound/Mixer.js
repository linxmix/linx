/** @jsx React.DOM */
var React = require('react');
var debug = require('debug')('views:bars/sound/Mixer');
var ReactBackboneMixin = require('backbone-react-component').mixin;
var classSet = require('react-addons').classSet;

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
        {
          key: 'volume',
          icon: 'volume up icon',
        },
      ],
    }
  },

  getInitialState: function () {
    return {
      'volumeOpen': true,
    };
  },

  // call appropriate handler on click
  handleClick: function (tab, e) {
    switch (tab.key) {
      case 'playpause': this.props.changePlayState(tab.handle); break;
      case 'back': this.props.back(tab, e); break;
      case 'forth': this.props.forth(tab, e); break;
      //case 'volume': this.toggleVolume(tab, e); break;
      default: debug(tab.key);
    }
  },

  toggleVolume: function (tab, e) {
    this.setState({
      'volumeOpen': !this.state.volumeOpen,
    });
  },

  setVolume: function (tab, bool) {
    if (tab.key === 'volume') {
      //this.setState({ 'volumeOpen': bool });
    }
  },

  render: function () {
    var tabs = this.props.tabs;

    // update playpause button
    var playing = (this.props.playState === 'play');
    var playpause = _.extend(tabs[1], {
      'handle': playing ? 'pause' : 'play',
    });
    // set loading icon if loading
    if (this.props.loading) {
      playpause['icon'] = 'orange loading icon';
    } else {
      playpause['icon'] = playpause.handle + ' icon';
    }
    tabs[1] = playpause;

    // make mixer tabs
    tabs = tabs.map(function(tab) {
      var name;
      if (tab.key === 'volume') {
        var className = classSet({
          'volume-slider': true,
          'volume-slider-open': this.state.volumeOpen,
          'volume-slider-closed': !this.state.volumeOpen,
        });
        name = (<div>
          <i className={tab.icon}></i>
          <div className={className}></div>
        </div>);
      } else {
        name = (<i className={tab.icon}></i>);
      }
      return Tab(_.extend({}, tab, {
        'name': name,
        'inactiveClass': 'ui icon item',
        //'onMouseEnter': this.setVolume.bind(this, tab, true),
        //'onMouseLeave': this.setVolume.bind(this, tab, false),
        'handleClick': this.handleClick,
      }))
    }.bind(this));
    // add given launchTab
    var launchTab = this.props.launchTab
    launchTab && tabs.unshift(launchTab);

    return (<div className="inverted ui icon menu">{tabs}</div>);
  },

  componentDidMount: function () {
    var d3 = require('d3');
    d3.slider = require('d3.slider');
    var volume = this.$('.volume-slider').get(0);
    var slider = d3.slider().min(0).max(1).step(0.01).value(this.props.masterVol);
    d3.select(volume).call(slider);
    slider.on('slide', function (e, val) {
      this.props.setMasterVol(val);
    }.bind(this));
  },

});