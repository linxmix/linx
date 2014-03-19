/** @jsx React.DOM */
var debug = require('debug')('views:SoundBar')
var React = require('react');
var ReactBackboneMixin = require('backbone-react-component').mixin;

var Tab = require('./nav/Tab');

module.exports = React.createClass({
  
  mixins: [ReactBackboneMixin],

  handleClick: function(soundTab) {
    this.props.changePlayState(soundTab.key);
  },

  getDefaultProps: function() {
    return {
      soundTabs: [
        {key: 'play', name: 'Play'},
        {key: 'pause', name: 'Pause'},
        {key: 'stop', name: 'Stop'},
      ]
    };
  },

  render: function () {

    // make soundTabs
    var soundTabs = this.props.soundTabs.map(function(soundTab) {
      return (
        Tab({
          'active': (soundTab.key === this.props.playState),
          'key': soundTab.key,
          'name': soundTab.name,
          'activeClass': 'active item',
          'inactiveClass': 'item',
          'handleClick': this.handleClick,
        })
      )
    }.bind(this));

    // render SoundBar
    return (
      <div className="ui grid">
        <div className="sixteen wide column">
          <div className="ui menu bottom-menu">
            {soundTabs}
            <iframe></iframe>
          </div>
        </div>
      </div>
    );
  },

  // rendered component has been mounted to a DOM element
  componentDidMount: function () {

    // setup SC widget
    debug("component mounted");
    var widgetFrame = this.$('iframe').get(0);
    console.log(widgetFrame);
    var widget = SC.Widget(widgetFrame);
  },

});