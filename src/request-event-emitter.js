const http = require("http");
const https = require("https");
const events = require("events");

const nodeMajorVersion = require("./node-major-version");
const { includeBody } = require("./options");
const idGenerator = require("./request-id-generator");

const instance = new events.EventEmitter();

http.request = attachEmitterTo.bind(http, http.request);
http.get = attachEmitterTo.bind(http, http.get);

/**
 * https.request proxies to http.request for 8.x and earlier versions
 */
if (nodeMajorVersion > 8) {
  https.get = attachEmitterTo.bind(https, https.get);
  https.request = attachEmitterTo.bind(https, https.request);
}

function attachEmitterTo(func, ...rest) {
  /**
   * @type {http.ClientRequest & {method: String, path: String}}
   * */
  const req = func.call(this, ...rest);

  const id = idGenerator();

  if (includeBody) {
    emitWithRequestBody(req, id);
  } else {
    req.prependOnceListener("finish", () => {
      instance.emit(
        "request",
        id,
        req.method,
        req.getHeader("host"),
        req.path,
        req.getHeaders()
      );
    });
  }

  req.prependOnceListener("response", function(
    /** @type {http.IncomingMessage} */ res
  ) {
    const { rawHeaders, statusCode, statusMessage, httpVersion } = res;

    instance.emit(
      "response",
      id,
      httpVersion,
      statusCode,
      statusMessage,
      rawHeaders
    );
  });

  return req;
}

function emitWithRequestBody(req, id) {
  const requestBody = [];

  const { Buffer } = require("buffer");
  const reqWrite = req.write;
  req.write = function() {
    /**
     * chunk can be either a string or a Buffer.
     */
    const chunk = arguments[0];

    if (Buffer.isBuffer(chunk)) {
      requestBody.push(chunk.toString());
    } else {
      requestBody.push(chunk);
    }

    return reqWrite.apply(this, arguments);
  };

  const reqEnd = req.end;
  req.end = function() {
    /**
     * the first argument might be a callback or a chunk
     */
    const maybeChunk = arguments[0];

    if (Buffer.isBuffer(maybeChunk)) {
      requestBody.push(maybeChunk.toString());
    } else if (maybeChunk && typeof maybeChunk !== "function") {
      requestBody.push(maybeChunk);
    }

    return reqEnd.apply(this, arguments);
  };

  req.prependOnceListener("finish", () => {
    instance.emit(
      "request",
      id,
      req.method,
      req.getHeader("host"),
      req.path,
      req.getHeaders(),
      requestBody.join("")
    );
  });
}

module.exports = instance;
