const { includeHeaders, includeBody } = require("./options");

const request = (id, method, host, path, headers, body) => {
  const lines = [`${id} - request: ${method} ${host}${path}`];

  if (includeHeaders) {
    for (let key of Object.keys(headers)) {
      lines.push(`${key}: ${headers[key]}`);
    }
  }

  if (includeBody && body) {
    lines.push(`${id} - request body:`);
    lines.push(body);
  }

  return lines.join("\n");
};

const response = (id, httpVersion, statusCode, statusMessage, rawHeaders) => {
  const lines = [
    `${id} - response: HTTP/${httpVersion} ${statusCode} ${statusMessage}`
  ];

  if (includeHeaders) {
    for (let idx = 0; idx < rawHeaders.length; idx += 2) {
      lines.push(`${rawHeaders[idx]}: ${rawHeaders[idx + 1]}`);
    }
  }

  return lines.join("\n");
};

module.exports = {
  request,
  response
};
