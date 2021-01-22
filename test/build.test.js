const build = require("../lib/build");
const http = require("http");

process.env.DOCKER_HOST='http://localhost:5010'

describe("lib", () => {
  let mockServer;

  before(() => {
    mockServer = http.createServer((request, response) => {
      response.write(
        JSON.stringify({ name: "xxxx", tags: ["latest", "1.7","1.3","1.5","1.10","1.4","1.2","1.9","1.8","1.1","1.6"] })
      );
      response.end();
    });
    mockServer.listen(5000);
  });

  after(() => {
    mockServer.close();
  });

  it("tag auto add version", (done) => {
    build({
      tag: "localhost:5000/xxxx/bbb:1",
      autoVersion: true,
    })(
      {
        dataDir: __dirname + "/dock",
        comment: console.log,
      },
      done
    );
  });
});
