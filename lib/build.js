'use strict';

var path = require('path');
var fs = require('fs');
var JSONStream = require('json-stream');
var Docker = require('dockerode');
var tar = require('tar-fs');
var push = require('./push');

module.exports = function(config) {
  return function (context, done) {
    var docker = new Docker();

    context.comment('Connecting to Docker: ' + process.env.DOCKER_HOST);

    var tarStream = tar.pack(context.dataDir);
    docker.buildImage(tarStream, {
      t: config.tag,
      q: false
    }, function (err, ostream) {
      if (err) { return done(err); }

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
          push(docker, config, done);
        } else {
          done();
        }
      });

      ostream.pipe(stream);

      ostream.on('end', function() {
        stream.end();
      });
    });
  };
};
