var Docker = require('dockerode');
var opt = require('dockerode-optionator');
var JSONStream = require('json-stream');

module.exports = {
  // Initialize the plugin for a job
  //   config:     taken from DB config extended by flat file config
  //   job & repo: see strider-runner-core
  //   cb(err, initialized plugin)
  init: function (config, job, context, cb) {
    config = config || {};
    
    if (config.tag && config.tag.length > 0) {
      var archivePath = '/tmp/archive.tar';
      
      cb(null, {
        prepare: {
          command: 'git',
          args: ['archive', '--format=tar', '-o', archivePath, 'HEAD']
        },
        
        test: {
          command: 'tar',
          args: ['-tf', archivePath]
        },
        
        deploy: function (context, done) {
          var dOpts = opt.normalizeOptions({}, process.env);
          
          context.comment('Connecting to Docker: ' + JSON.stringify(dOpts, null, 4));
          
          var docker = new Docker(dOpts);
          
          docker.buildImage(archivePath, {
            t: config.tag,
            q: false
          }, function (err, ostream) {
            if (err) {
              return done(err);
            }
            
            var stream = new JSONStream();
            
            stream.on('data', function (data) {
              if (data.stream) {
                context.out(data.stream);
              } else if (data.error) {
                context.out(data.errorDetail.message);
                err = new Error(data.error);
              }
            });
            
            stream.on('error', function(err) {
              err = err;
            });
            
            stream.on('end', function() {
              done(err);
            });
            
            ostream.pipe(stream);
          });
        }
      })
    } else {
      cb(new Error('no tag name configured'));
    }
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
