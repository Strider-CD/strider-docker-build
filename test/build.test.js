const build = require("../lib/build");
const http = require("http");

process.env.DOCKER_HOST='http://localhost:5010'

describe("lib", () => {
  let mockServer;

  before(() => {
    mockServer = http.createServer((request, response) => {
      response.write(
        JSON.stringify({ name: "xxxx", tags: ["latest"] })
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
