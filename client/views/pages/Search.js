/** @jsx React.DOM */
var React = require('react');
var debug = require('debug')('views:Search');
var ReactBackboneMixin = require('backbone-react-component').mixin;

var SearchBar = require('./SearchBar');

module.exports = React.createClass({
  
  mixins: [ReactBackboneMixin],

  render: function () {

    SC.get('/tracks', { q: 'buskers', license: 'cc-by-sa' }, function(tracks) {
      console.log(tracks);
    });

    /*
    this.props.collection.echoNest.search({
      'url': "song/search",
      'query': {},
      'success': function (collection, response, options) {
        console.log("SUCCESS", collection, response, options);
      },
    });
    */

    return (
      <div className="ui grid">
        <div className="sixteen wide column">
          {SearchBar(this.props)}
        </div>
        <div className="sixteen wide column">
        TODO
        </div>
      </div>
    );
  },

});