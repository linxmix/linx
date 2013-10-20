Package.describe({
  summary: "Custom app NPM dependencies"
});

Npm.depends({
 'echojs': '0.1.4'
});

Package.on_use(function (api) {

  // ensure backwards compatibility with Meteor pre-0.6.5
  if (api.export) {
    api.export('Echojs');
  }

  console.log('adding echojs');
  api.add_files("mynpms.js", "server");
});