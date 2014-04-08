/** @jsx React.DOM */
var React = require('react');
var debug = require('debug')('views:Left')
var ReactBackboneMixin = require('backbone-react-component').mixin;

var Tab = require('./bars/nav/Tab');

var SoundBar = require('./bars/sound/SoundBar');

module.exports = React.createClass({
  
  mixins: [ReactBackboneMixin],

  getDefaultProps: function () {
    return {
      'tabs': [
        {
          key: 'playlists',
          name: 'Playlists',
          icon: 'list layout icon',
        },
        {
          key: 'search',
          name: 'Search',
          icon: 'search icon',
        },
      ],
    }
  },

  toggleBar: function (tabKey) {
    this.props.changeBar({
      'bottomBar': (this.props.bottomBar) ? 0 : 2,
    });
  },

  tabClick: function (tab) {
    console.log("TAB CLICK", tab);
    this.toggleBar(tab.key);
  },

  render: function () {

    // make tabs
    var tabs = this.props.tabs.map(function(tab) {
      return (
        Tab({
          'key': tab.key,
          'name': (<i className={tab.icon}></i>),
          'inactiveClass': 'item',
          'handleClick': this.tabClick,
        })
      )
    }.bind(this));
    
    // determine if bar should be hidden
    var hidden = (this.props.bottomBar) ? '' : 'hidden';
    return (
      <div className="bottom-menu">
        <div className="bottom-sidebar">
          <div className="ui icon menu">
            {tabs}
          </div>
        </div>
        <div className={hidden}>
          {SoundBar(this.props)}
        </div>
      </div>
    );
  },

});