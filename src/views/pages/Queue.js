/** @jsx React.DOM */
var React = require('react');
var ReactBackboneMixin = require('backbone-react-component').mixin;

var Tracks_Table = require('../track/Tracks_Table');
  
var QueueMenu = require('./QueueMenu');

module.exports = React.createClass({
  
  mixins: [ReactBackboneMixin],

  getInitialState: function() {
    return {
      'trackView': 'table-sc',
    }
  },

  changeTrackView: function(newTrackView) {
    this.setState({
      'trackView': newTrackView,
    });
  },

  render: function () {
      
    // create tracks view
    var tracks = Tracks_Table({
      'tracks': this.getCollection().queue,
      'trackView': this.state.trackView,
      'changePlayState': this.props.changePlayState,
    });

    // set default message
    var defaultMessage = (this.getCollection().queue.length === 0) ?
      'No tracks queued.' : '';

    return (
      <div className="ui grid">
        <div className="sixteen wide column">
          {QueueMenu({
            'trackView': this.state.trackView,
            'changeTrackView': this.changeTrackView,
            'changePage': this.props.changePage,
          })}
        </div>
        <div className="sixteen wide column">
          {defaultMessage}
          {tracks}
        </div>
      </div>


      /*<div className="ui grid">
        <div className="four wide column">
          <div className="ui inverted segment"></div>
        </div>
        <div className="four wide column">
        </div>
      </div>*/
    );
  },

});