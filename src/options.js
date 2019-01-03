const includeHeaders = process.env.LOG_THAT_HTTP_HEADERS === "true";
const includeBody = process.env.LOG_THAT_HTTP_BODY === "true";

module.exports = {
  includeBody,
  includeHeaders
};
