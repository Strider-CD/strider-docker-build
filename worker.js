// We'll create a stream shortly.
var JSONStream = require('json-stream');

// Export.
module.exports = {
  // Initialize the plugin for a job
  //   config:     taken from DB config extended by flat file config
  //   job & repo: see strider-runner-core
  //   cb(err, initialized plugin)
  init: function (configuration, job, context, cb) {
    var
      // Where to stash the archived project.
      archivePath = '/tmp/archive.tar',

      // Get the config (if any.)
      config = configuration || {},

      // The options to pass to the callback.
      options = {
        // Prepare our tests.
        prepare: {
          command: 'git',
          args: ['archive', '--format=tar', '-o', archivePath, 'HEAD']
        }
      };

    // Add the build instructions here.
    options[config.buildPhase] = require('./deployInstructions')(archivePath, config);

    // Register the plugin and it's options.
    cb(null, options);
  },

  // If provided, autodetect is run if the project has *no* plugin
  // configuration at all.
  autodetect: {
    filename: 'Dockerfile',
    exists: true,
    language: 'docker',
    framework: null
  }
}

