'use strict';

const debug = require('debug')('strider-docker-build:build');
const Docker = require('dockerode');
const JSONStream = require('json-stream');
const push = require('./push');
const tar = require('tar-fs');

module.exports = function (config) {
  return function (context, done) {
    const docker = new Docker();

    context.comment(`Connecting to Docker: ${process.env.DOCKER_HOST}`);

    const tarStream = tar.pack(context.dataDir);
    docker.buildImage(tarStream, {
      t: config.tag,
      q: false
    }, function (err, ostream) {
      if (err) {
        return done(err);
      }

      var stream = new JSONStream();
      let buildErr;

      stream.on('data', function (data) {
        if (data.stream) {
          context.out(data.stream);
        } else if (data.error) {
          context.out(data.errorDetail.message);
          err = new Error(data.error);
        }
      });

      stream.on('error', function (err) {
        debug(err);
        buildErr = err;
      });

      stream.on('end', function () {
        if (buildErr) {
          return done(buildErr);
        }

        if (config.push) {
          push(docker, config, context, done);
        } else {
          done();
        }
      });

      ostream.pipe(stream);

      ostream.on('end', function () {
        stream.end();
      });
    });
  };
};
