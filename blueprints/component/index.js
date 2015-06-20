var fs          = require('fs-extra');
var path        = require('path');
var chalk       = require('chalk');

module.exports = {
  description: 'Generates a component. Name must contain a hyphen.',

  // locals: function(options) {
  //   // Return custom template variables here.
  //   return {
  //     foo: options.entity.options.foo
  //   };
  // }

  afterInstall: function(options) {
    var entity  = options.entity;

    addImportToAppStyle(entity.name, {
      root: options.project.root,
    });
    this.ui.writeLine('updating app.scss');
    this._writeStatusToUI(chalk.green, 'add stylesheet to app.scss', entity.name);
  },
};

function addImportToAppStyle(name, options) {
  var appStylePath = path.join(options.root, 'app', 'styles', 'app.scss');
  var source = fs.readFileSync(appStylePath, 'utf-8');

  var importString = "@import 'components/" + name + "';\n";

  fs.writeFileSync(appStylePath, source + importString);
}
