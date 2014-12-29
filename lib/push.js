'use strict';

var JSONStream = require('json-stream');

module.exports = function (docker, config) {
  var image = docker.getImage(config.tag);

  console.log('pushing..');

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
  else {
    console.error('Invalid docker image');
  }
};
