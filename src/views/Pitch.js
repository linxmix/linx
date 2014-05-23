/** @jsx React.DOM */
var debug = require('debug')('views:Pitch')
var React = require('react');
var ReactCSSTransitionGroup = require('react-addons').CSSTransitionGroup;
var ReactBackboneMixin = require('backbone-react-component').mixin;

var _ = require('underscore');

module.exports = React.createClass({
  
  mixins: [ReactBackboneMixin],
    
  getInitialState: function () {
    return {
      'items': ['hello'],
    };
  },

  render: function () {
    var items = this.state.items.map(function(item, i) {
      return (
        <div key={item} className="large inverted purple ui segment">
          {item}
        </div>
      );
    }.bind(this));
    return (
      <div>
        <img href="/static/soundcloud-track.png"></img>
        <div className="view_port">
          <div className="polling_message">
            Listening for dispatches
          </div>
          <div className="cylon_eye"></div>
        </div>
        <ReactCSSTransitionGroup transitionName="example">
          {items}
        </ReactCSSTransitionGroup>
      </div>
    );
  },

  componentDidMount: function () {
    window.setTimeout(function () {
      var newItems = this.state.items;
      newItems.splice(0, 1)
      this.setState({items: newItems});
    }.bind(this), 1000);
  },

});