const emitter = require("./src/request-event-emitter");
const logger = require("./src/logger");
const { request, response } = require("./src/formatter");

emitter.on("request", (id, method, host, path, headers, body) => {
  logger.log(request(id, method, host, path, headers, body));
});

emitter.on(
  "response",
  (id, httpVersion, statusCode, statusMessage, rawHeaders) => {
    logger.log(
      response(id, httpVersion, statusCode, statusMessage, rawHeaders)
    );
  }
);
