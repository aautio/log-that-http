const axios = require("axios").default;
const sandbox = require("sinon").createSandbox();
const emitter = require("../src/request-event-emitter");

describe("Testing log output amounts", function() {
  const server = require("./server");
  let close;
  const spy = sandbox.spy();

  before(function() {
    close = server();
    const logger = require("../src/logger");
    sandbox.replace(logger, "log", spy);

    require("../index");
  });

  after(function() {
    close();

    delete require.cache[require.resolve("../index")];
    emitter.removeAllListeners();
  });

  afterEach(function() {
    sandbox.reset();
  });

  it("writes two log entries on http 200", function() {
    return axios.get("http://localhost:8081/ok").then(() => {
      sandbox.assert.calledTwice(spy);
    });
  });

  it("writes four log entries with http 302 redirect", function() {
    return axios.get("http://localhost:8081/redirect").then(() => {
      sandbox.assert.callCount(spy, 4);
    });
  });

  it("writes two log entries on http 404", function() {
    return axios
      .get("http://localhost:8081/not_found", {
        validateStatus: status => status === 404
      })
      .then(() => {
        sandbox.assert.calledTwice(spy);
      });
  });

  it("writes only one log entry when connection dropped and no response received", function() {
    return axios
      .get("http://localhost:8081/close_without_response")
      .catch(err => {
        if (err.code === "ECONNRESET") {
          sandbox.assert.calledOnce(spy);
        } else {
          throw err;
        }
      });
  });

  it("writes only one log entry when server sends random garbage", function() {
    return axios.get("http://localhost:8081/corrupted").catch(err => {
      if (err.code === "HPE_INVALID_CONSTANT") {
        sandbox.assert.calledOnce(spy);
      } else {
        throw err;
      }
    });
  });

  it("requests and responses have matching identifier numbers", function() {
    return axios.get("http://localhost:8081/ok").then(() => {
      const reqId = spy.firstCall.args[0].match(
        /^(\d+) - request: GET localhost:8081\/ok$/
      )[1];
      const resId = spy.secondCall.args[0].match(
        /^(\d+) - response: HTTP\/1\.1 200 OK$/
      )[1];

      if (reqId !== resId)
        throw new Error(`Request ${reqId} does not match response ${resId}`);
    });
  });
});
