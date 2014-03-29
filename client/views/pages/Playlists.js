/** @jsx React.DOM */
var React = require('react');
var debug = require('debug')('views:Library');
var ReactBackboneMixin = require('backbone-react-component').mixin;

module.exports = React.createClass({
  
  mixins: [ReactBackboneMixin],

  render: function () {

    // get all SC playlists with >= 100 likes
    SC.get('/playlists', { playback_count: 50 }, function(playlists, error) {
      if (error) { alert('Error: ' + error.message); }
      else {
        console.log(playlists);
      }
    });

    return (
      <div className="ui grid">
        <div className="sixteen wide column">
          TODO
        </div>
      </div>
    );

  },

});