/** @jsx React.DOM */
var React = require('react');
var ReactBackboneMixin = require('backbone-react-component').mixin;
var debug = require('debug')('views:track/Track_List_SC');


module.exports = React.createClass({
  
  mixins: [ReactBackboneMixin],

  // TODO
  // view this track
  viewTrack: function () {
    var track = this.props.track;
    debug("viewing track", track);
  },

  render: function () {
    var track = this.props.track;

    return (
      <div className="fluid purple ui label">
        {track && track.get('title')}
      </div>
    );
  },

});
//<div className="ui small button" onClick={this.viewTrack}>View Track</div>