/** @jsx React.DOM */
var React = require('react');
var ReactBackboneMixin = require('backbone-react-component').mixin;

var Tab = require('../nav/Tab');

module.exports = React.createClass({
  
  mixins: [ReactBackboneMixin],

  getDefaultProps: function() {
    return {
      trackViewTabs: [
        {key: 'list', name: 'List View'},
        {key: 'wave', name: 'Wave View'},
      ]
    };
  },

  render: function () {


    // make trackViewTabs
    var trackViewTabs = this.props.trackViewTabs.map(function(trackViewTab) {
      return (
        Tab({
          'active': (trackViewTab.key === this.props.trackView),
          'key': trackViewTab.key,
          'name': trackViewTab.name,
          'activeClass': 'ui orange button',
          'inactiveClass': 'ui inverted button',
          'handleClick': this.props.changeTrackView,
        })
      )
    }.bind(this));

    return (
      <div className="eight wide column">
        <div className="ui inverted teal segment">

          <div className="ui buttons">
            {trackViewTabs[0]}
            <div className="or"></div>
            {trackViewTabs[1]}
          </div>
        </div>

        // TODO: dropdown for what list we're viewing
          /*<div className="ui teal buttons">
            <div className="ui button">Save</div>
            <div className="ui teal floating dropdown icon button">
              <i className="dropdown icon"></i>
              <div className="menu">
                <div className="item">Edit Post</div>
                <div className="item">Remove Post</div>
                <div className="item">Hide Post</div>
              </div>
            </div>
          </div>*/

      </div>
    );
  },

});