const http = require("http");
const https = require("https");
const events = require("events");

const idGenerator = (function*() {
  let index = 1;
  while (true) {
    yield index++;
  }
})();

const nodeMajorVersion = +process.version.match(/^v(\d+)\.(\d+)\.(\d+)$/)[1];

const instance = new events.EventEmitter();

http.request = attachEmitterTo.bind(http, http.request);

/**
 * http.get should not be wrapped for 7.x and earlier versions
 */
if (nodeMajorVersion >= 8) {
  http.get = attachEmitterTo.bind(http, http.get);
}

/**
 * https.request proxies to http.request for 8.x and earlier versions
 */
if (nodeMajorVersion > 8) {
  https.get = attachEmitterTo.bind(https, https.get);
  https.request = attachEmitterTo.bind(https, https.request);
}

const includeBody = process.env.LOG_THAT_HTTP_BODY === "true";

function attachEmitterTo(func, ...rest) {
  /**
   * @type {http.ClientRequest & {method: String, path: String, _headers: http.OutgoingHttpHeaders}}
   * */
  const req = func.call(this, ...rest);

  const bodyData = [];

  if (includeBody) {
    const { Buffer } = require("buffer");
    const reqWrite = req.write;
    req.write = function() {
      /**
       * chunk can be either a string or a Buffer. If it is a string an encoding mi
       */
      const chunk = arguments[0];

      if (Buffer.isBuffer(chunk)) {
        bodyData.push(chunk.toString());
      } else {
        bodyData.push(chunk);
      }

      return reqWrite.apply(this, arguments);
    };
  }

  const id = idGenerator.next().value;

  req.once("finish", () => {
    instance.emit(
      "request",
      id,
      req.method,
      req.getHeader("host"),
      req.path,
      /*
       * ClientRequest.getHeaders() is available from node 7. Older ones have ClientRequest._headers:
       */
      nodeMajorVersion > 6 ? req.getHeaders() : req._headers,
      bodyData.join("")
    );
  });

  req.once("response", res => {
    const { rawHeaders, statusCode, statusMessage, httpVersion } = res;

    instance.emit(
      "response",
      id,
      httpVersion,
      statusCode,
      statusMessage,
      rawHeaders
    );

    res.once("end", () => {
      // body would be streamed by now
    });
  });

  return req;
}

module.exports = instance;
