/** @jsx React.DOM */
var React = require('react');
var ReactBackboneMixin = require('backbone-react-component').mixin;

var PinBar = require('./bars/PinBar');

module.exports = React.createClass({
  
  mixins: [ReactBackboneMixin],

  render: function () {
    // determine if this should be hidden
    var hidden = (this.props.rightBar) ? '' : 'hidden';
    return (
      <div className={hidden}>
        {PinBar(this.props)}
      </div>
    );
  },
});