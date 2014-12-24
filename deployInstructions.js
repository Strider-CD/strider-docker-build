// We'll create a stream shortly.
var JSONStream = require('json-stream');

module.exports = function(archivePath, config) {
  return function (context, done) {
    // Normalise docker-related environment variables
    var opt = require('dockerode-optionator');

    var dOpts = opt.normalizeOptions({}, process.env);

    context.comment('Connecting to Docker: ' + JSON.stringify(dOpts, null, 4));

    var docker = new (require('dockerode'))(dOpts);

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

      // Pipe to event-stream.
      ostream.pipe(function(data) {
        var pipe_data = null;

        // Try to parse as JSON.
        try {
          pipe_data = JSON.parse(data);
        } catch(error) {
          // It isn't JSON so make it JSON.
          pipe_data = {
            type: 'stdout',
            data: data.toString()
          };
        }

        // Write out.
        stream(pipe_data);
      });
    });
  };
}

