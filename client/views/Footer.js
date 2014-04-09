/** @jsx React.DOM */
var React = require('react');
var debug = require('debug')('views:Footer')
var ReactBackboneMixin = require('backbone-react-component').mixin;

var Tab = require('./bars/nav/Tab');

var _ = require('underscore');

var SoundBar = require('./bars/sound/SoundBar');
var SoundBar_Collapse = require('./bars/sound/SoundBar_Collapse');

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
    var queue = this.getCollection().queue;
    var menu = (isHidden) ? SoundBar_Collapse(_.extend({}, this.props, {
      'playState': this.props.playState,
      'handlers': {
        'playpause': this.props.changePlayState,
        'forth': queue.shift,
        'back': function () { debug("back"); },
      },
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