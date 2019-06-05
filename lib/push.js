'use strict';

const debug = require('debug')('strider-docker-build:push');
const JSONStream = require('json-stream');

module.exports = function (docker, config, context, done) {
  const image = docker.getImage(config.tag);

  debug('pushing..');

  if (image) {
    console.log('process.env.REGISTRY_AUTH',process.env.REGISTRY_AUTH);
    image.push({authconfig: {base64:process.env.REGISTRY_AUTH}}, function (err, pstream) {
      if (err) {
        return done(err);
      }

      const pushStream = new JSONStream();
      let pushErr;

      pushStream.on('data', function (data) {
        if (data.stream) {
          context.out(data.stream);
        } else if (data.error) {
          context.out(data.errorDetail.message);
          pushErr = new Error(data.error);
        }
      });

      pushStream.on('error', function (err) {
        pushErr = err;
      });

      pushStream.on('end', function () {
        done(pushErr);
      });

      pstream.pipe(pushStream);
    });
  } else {
    done('Invalid docker image');
  }
};
