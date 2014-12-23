'use strict';

var path = require('path');
var fs = require('fs');
var JSONStream = require('json-stream');
var Docker = require('dockerode');
var opt = require('dockerode-optionator');
var certsFolder = process.env.DOCKER_CERT_PATH;

module.exports = function(archivePath, config) {
  return function (context, done) {
    // Normalise docker-related environment variables
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
        if (err) {
          return done(err);
        }

        if (config.push) {
          console.log('pushing..');
          var image = docker.getImage(config.tag);

          if (image) {
            image.push(function (err, pstream) {
              if (err) {
                return done(err);
              }

              var pushStream = new JSONStream();
              var pushErr;

              pushStream.on('data', function (data) {
                if (data.stream) {
                  context.out(data.stream);
                } else if (data.error) {
                  context.out(data.errorDetail.message);
                  pushErr = new Error(data.error);
                }
              });

              pushStream.on('error', function(err) {
                pushErr = err;
              });

              pushStream.on('end', function() {
                done(pushErr);
              });

              pstream.pipe(pushStream);
            });
          }
        }
      });

      ostream.pipe(stream);
    });
  };
};
