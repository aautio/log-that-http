const close = require("../../test/server")();

const fetch = require("node-fetch").default;

const https = require("https");
const agent = new https.Agent({
  rejectUnauthorized: false
});

function* main() {
  // HTTP

  yield fetch("http://localhost:8081/ok");
  yield fetch("http://localhost:8081/ok", {
    method: "POST",
    body: "HELLO WORLD"
  });
  yield fetch("http://localhost:8081/ok", { method: "DELETE" });

  yield fetch("http://localhost:8081/redirect");
  yield fetch("http://localhost:8081/not_found");
  yield fetch("http://localhost:8081/close_without_response").catch(err => {
    if (err.code === "ECONNRESET") {
      // this was expected
    } else {
      throw err;
    }
  });
  yield fetch("http://localhost:8081/corrupted").catch(err => {
    if (err.code === "HPE_INVALID_CONSTANT") {
      // this was expected
    } else {
      throw err;
    }
  });

  // HTTPS

  yield fetch("https://localhost:8443/ok", { agent });
  yield fetch("https://localhost:8443/ok", { method: "POST", agent });
  yield fetch("https://localhost:8443/ok", { method: "DELETE", agent });

  yield fetch("https://localhost:8443/redirect", { agent });
  yield fetch("https://localhost:8443/not_found", {
    agent
  });
  yield fetch("https://localhost:8443/close_without_response", { agent }).catch(
    err => {
      if (err.code === "ECONNRESET") {
        // this was expected
      } else {
        throw err;
      }
    }
  );
  yield fetch("https://localhost:8443/corrupted", { agent }).catch(err => {
    if (err.code === "HPE_INVALID_CONSTANT") {
      // this was expected
    } else {
      throw err;
    }
  });
}

const testGenerator = main();

function executeOneTest() {
  let check = testGenerator.next().value;
  if (check == null) {
    close();
  } else {
    check
      .then(() => {
        setImmediate(executeOneTest);
      })
      .catch(err => {
        // eslint-disable-next-line no-console
        console.error(err);
        process.exit(1);
      });
  }
}

executeOneTest();
