const axios = require("axios").default;
const sinon = require("sinon");
const sandbox = sinon.createSandbox();
const emitter = require("../src/request-event-emitter");

describe("Testing LOG_THAT_HTTP_HEADERS=false LOG_THAT_HTTP_BODY=false", function() {
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

  it("has one line of log for requests and responses", function() {
    return axios.get("http://localhost:8081/ok").then(() => {
      sandbox.assert.calledWithExactly(
        spy.getCall(0),
        sinon.match(/^[^\r\n]+$/)
      );
      sandbox.assert.calledWithExactly(
        spy.getCall(1),
        sinon.match(/^[^\r\n]+$/)
      );
    });
  });
});
