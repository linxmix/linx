// create globals to play with on client
PouchDB = require('pouchdb');
BackbonePouch = require('backbone-pouch');
Marionette = require('backbone.marionette');
Marionette.$ = $;
Backbone = require('backbone.marionette/node_modules/backbone');
Backbone.$ = $;
_ = require('underscore');

var Linx = require('./app.js');

// load the application once the DOM is ready, using `jQuery.ready`:
$(function () {

  // enable PouchDB debugging
  // Pouch.DEBUG = true;

  // adjust id attribute to the one PouchDB uses.
  Backbone.Model.prototype.idAttribute = '_id';

  Backbone.sync = BackbonePouch.sync({
    // suffix with version in case of necessary upgrade.
    db: PouchDB('linx0'),
  });

  Linx.start();
});

/*Backbone.Marionette.TemplateCache.prototype.loadTemplate = function (templateId) {
  // load your template here, returning the data needed for the compileTemplate
  // function. For example, you have a function that creates templates based on the
  // value of templateId
  return fs.readFileSync(templateId);
}*/


require('./modules/daw.js');
require('./models/track.js');
require('./collections/tracks.js');
require('./views/tracks.js')
