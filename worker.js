module.exports = {
  // Initialize the plugin for a job
  //   config:     taken from DB config extended by flat file config
  //   job & repo: see strider-runner-core
  //   cb(err, initialized plugin)
  init: function (config, job, context, cb) {
    config = config || {}
    cb(null, {})
  },
  // if provided, autodetect is run if the project has *no* plugin
  // configuration at all.
  autodetect: {
    filename: 'Dockerfile',
    exists: true,
    language: 'docker',
    framework: null
  }
}

