/** @jsx React.DOM */
var React = require('react');
var debug = require('debug')('views:Footer')
var ReactBackboneMixin = require('backbone-react-component').mixin;

var Tab = require('./bars/nav/Tab');

var _ = require('underscore');

var SoundBar = require('./bars/sound/SoundBar');
var Mixer = require('./bars/sound/Mixer');

module.exports = React.createClass({
  
  mixins: [ReactBackboneMixin],

  toggleBar: function () {
    this.props.changeBar({
      'bottomBar': (this.props.bottomBar) ? 0 : 2,
    });
  },

  launchTabClick: function (launchTab) {
    console.log("TAB CLICK", launchTab);
    this.toggleBar();
  },

  render: function () {

    // determine if bar should be hidden
    var isHidden = !this.props.bottomBar; // 0 if hidden
    var hidden = (isHidden) ? 'hidden' : '';

    // make launchTab
    var launchTabName = (isHidden) ? (<i className="up arrow icon"></i>) :
      (<i className="down arrow icon"></i>);
    var launchTab = Tab({
      'name': launchTabName,
      'active': isHidden,
      'activeClass': 'black ui icon active item',
      'inactiveClass': 'black ui button icon item',
      'handleClick': this.launchTabClick,
    });

    // if bar is hidden, make collapse view
    var menu = (true) ? Mixer(_.extend({}, this.props, {
      'launchTab': launchTab,
    // else just make launchTab
    })) : launchTab;

    return (
      <div className="bottom-menu">
        <div className="bottom-sidebar">
          {menu}
        </div>
        <div className={hidden}>
          {SoundBar(this.props)}
        </div>
      </div>
    );
  },

});