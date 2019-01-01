const close = require("../../test/server")();

const axios = require("axios").default;

const https = require("https");
const httpsAgent = new https.Agent({
  rejectUnauthorized: false
});

function* main() {
  // HTTP

  yield axios.get("http://localhost:8081/ok");
  yield axios.post("http://localhost:8081/ok", "HELLO WORLD");
  yield axios.delete("http://localhost:8081/ok");

  yield axios.get("http://localhost:8081/redirect");
  yield axios.get("http://localhost:8081/not_found", {
    validateStatus: status => status === 404
  });
  yield axios.get("http://localhost:8081/close_without_response").catch(err => {
    if (err.code === "ECONNRESET") {
      // this was expected
    } else {
      throw err;
    }
  });
  yield axios.get("http://localhost:8081/corrupted").catch(err => {
    if (err.code === "HPE_INVALID_CONSTANT") {
      // this was expected
    } else {
      throw err;
    }
  });

  // HTTPS

  yield axios.get("https://localhost:8443/ok", { httpsAgent });
  yield axios.post("https://localhost:8443/ok", null, { httpsAgent });
  yield axios.delete("https://localhost:8443/ok", { httpsAgent });

  yield axios.get("https://localhost:8443/redirect", { httpsAgent });
  yield axios.get("https://localhost:8443/not_found", {
    httpsAgent,
    validateStatus: status => status === 404
  });
  yield axios
    .get("https://localhost:8443/close_without_response", { httpsAgent })
    .catch(err => {
      if (err.code === "ECONNRESET") {
        // this was expected
      } else {
        throw err;
      }
    });
  yield axios
    .get("https://localhost:8443/corrupted", { httpsAgent })
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
