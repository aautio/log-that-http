const close = require("../../test/server")();

const got = require("got");

const https = require("https");
const http = require("http");
const httpsAgent = new https.Agent({
  rejectUnauthorized: false
});

function* main() {
  // HTTP

  yield got.get("http://localhost:8081/ok");
  yield got.post("http://localhost:8081/ok", { body: "HELLO WORLD" });
  yield got.delete("http://localhost:8081/ok");

  yield got.get("http://localhost:8081/redirect");
  yield got
    .get("http://localhost:8081/not_found", { throwHttpErrors: false })
    .then(res => {
      if (res.statusCode !== 404) {
        throw new Error(`Unexpected status ${res.statusCode}`);
      }
    });
  yield got.get("http://localhost:8081/close_without_response").catch(err => {
    if (err.code === "ECONNRESET") {
      // this was expected
    } else {
      throw err;
    }
  });
  yield got.get("http://localhost:8081/corrupted").catch(err => {
    if (err.code === "HPE_INVALID_CONSTANT") {
      // this was expected
    } else {
      throw err;
    }
  });

  // HTTPS

  const agentsForHttps = { http: new http.Agent(), https: httpsAgent };

  yield got.get("https://localhost:8443/ok", {
    agent: agentsForHttps
  });

  yield got.post("https://localhost:8443/ok", {
    agent: agentsForHttps
  });

  yield got.delete("https://localhost:8443/ok", {
    agent: agentsForHttps
  });

  yield got.get("https://localhost:8443/redirect", {
    agent: agentsForHttps
  });

  yield got
    .get("https://localhost:8443/not_found", {
      agent: agentsForHttps,
      throwHttpErrors: false
    })
    .then(res => {
      if (res.statusCode !== 404) {
        throw new Error(`Unexpected status ${res.statusCode}`);
      }
    });

  yield got
    .get("https://localhost:8443/close_without_response", {
      agent: agentsForHttps
    })
    .catch(err => {
      if (err.code === "ECONNRESET") {
        // this was expected
      } else {
        throw err;
      }
    });

  yield got
    .get("https://localhost:8443/corrupted", {
      agent: agentsForHttps
    })
    .catch(err => {
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
