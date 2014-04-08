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
          icon: '',
        },
      ],
    }
  },

  toggleBar: function () {
    this.props.changeBar({
      'bottomBar': (this.props.bottomBar) ? 0 : 2,
    });
  },

  tabClick: function (tab) {
    console.log("TAB CLICK", tab);
    this.toggleBar();
  },

  render: function () {

    // determine if bar should be hidden
    var isHidden = !this.props.bottomBar;
    var hidden = (isHidden) ? 'hidden' : '';

    // make tab
    var tabName = (isHidden) ? (<i className="up arrow icon"></i>) :
      (<i className="down arrow icon"></i>);
    var tab = Tab({
      'name': tabName,
      'inactiveClass': 'item',
      'handleClick': this.tabClick,
    });

    return (
      <div className="bottom-menu">
        <div className="bottom-sidebar">
          <div className="ui inverted icon menu">
            {tab}
          </div>
        </div>
        <div className={hidden}>
          {SoundBar(this.props)}
        </div>
      </div>
    );
  },

});