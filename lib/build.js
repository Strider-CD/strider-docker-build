'use strict';

var path = require('path');
var fs = require('fs');
var JSONStream = require('json-stream');
var Docker = require('dockerode');
var opt = require('dockerode-optionator');
var push = require('./push');

var tar = require('tar-fs');

module.exports = function(archivePath, config) {
  return function (context, done) {
    // Normalise docker-related environment variables
    var dOpts = opt.normalizeOptions({}, process.env);

    var pack = tar.pack(process.cwd())
      .pipe(fs.createWriteStream(archivePath));

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
        if (err) {
          return done(err);
        }

        if (config.push) {
          push(docker, config);
        }
      });

      ostream.pipe(stream);
    });
  };
};
