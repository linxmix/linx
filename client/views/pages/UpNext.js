/** @jsx React.DOM */
var React = require('react');
var ReactBackboneMixin = require('backbone-react-component').mixin;

var Tracks_List = require('../track/Tracks_List');
var Tracks_Wave = require('../track/Tracks_Wave');
  
var LibraryMenu = require('./LibraryMenu');

module.exports = React.createClass({
  
  mixins: [ReactBackboneMixin],

  getInitialState: function() {
    return {
      'trackView': 'list',
    }
  },

  changeTrackView: function(newTrackView) {
    this.setState({
      'trackView': newTrackView,
    });
  },

  render: function () {
      
    // determine which tracks view to use
    var tracks;
    switch(this.state.trackView) {
      case 'list':
        tracks = Tracks_List({
          'tracks': this.getCollection().queue.models,
          'changePlayState': this.props.changePlayState,
        });
        break;
      case 'wave':
        tracks = Tracks_Wave({
          'tracks': this.getCollection().queue.models,
          'changePlayState': this.props.changePlayState,
        });
        break;
    }

    return (
      <div className="ui grid">
        <div className="sixteen wide column">
          {LibraryMenu({
            'trackView': this.state.trackView,
            'changeTrackView': this.changeTrackView,
          })}
        </div>
        <div className="sixteen wide column">
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