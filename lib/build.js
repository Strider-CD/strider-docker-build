"use strict";

const debug = require("debug")("strider-docker-build:build");
const Docker = require("dockerode");
const JSONStream = require("json-stream");
const push = require("./push");
const tar = require("tar-fs");
const axios = require("axios");

function getLatestVersion(context, config, callback) {
  if (config.autoVersion) {
    const tags = config.tag.split("/");
    const name = tags
      .slice(1, tags.length - 1)
      .concat(tags[tags.length - 1].split(":")[0])
      .join("/");
    const remote = `http://${tags[0]}/v2/${name}/tags/list`;
    context.comment(`fetch: ${remote}`);
    axios
      .get(remote)
      .then((res) => {
        const v = res.data.tags
          .sort((a, b) => {
            const va = a.split(".").map((t) => parseInt(t));
            const vb = b.split(".").map((t) => parseInt(t));
            for (let i = 0; i < Math.max(va.length, vb.length); i++) {
              if (va[i] > vb[i]) {
                return 1;
              } else if (va[i] < vb[i]) {
                return -1;
              }
            }
            return 0;
          })
          .reverse()
          .find((v) => {
            return v !== "latest";
          });
        const vs = v ? v.split("-")[0].split(".") : "1.0".split(".");
        vs[vs.length - 1] = parseInt(vs[vs.length - 1]) + 1;
        const version = vs.join(".");
        const tag = tags[0] + "/" + name + ":" + version;
        context.comment(`tag: ${tag}`);
        callback(null, tag);
      })
      .catch(callback);
  } else {
    callback(null, config.tag);
  }
}

module.exports = function (config) {
  return function (context, done) {
    const docker = new Docker();

    context.comment(`Connecting to Docker: ${process.env.DOCKER_HOST}`);

    getLatestVersion(context, config, (err, tag) => {
      if (err) {
        return done(err);
      }
      const tarStream = tar.pack(context.dataDir);
      docker.buildImage(
        tarStream,
        {
          t: tag,
          q: false,
        },
        function (err, ostream) {
          if (err) {
            return done(err);
          }

          var stream = new JSONStream();
          let buildErr;

          stream.on("data", function (data) {
            if (data.stream) {
              context.out(data.stream);
            } else if (data.error) {
              context.out(data.errorDetail.message);
              err = new Error(data.error);
            }
          });

          stream.on("error", function (err) {
            debug(err);
            buildErr = err;
          });

          stream.on("end", function () {
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

          ostream.on("end", function () {
            stream.end();
          });
        }
      );
    });
  };
};
