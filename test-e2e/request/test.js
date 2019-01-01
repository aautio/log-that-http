const close = require("../../test/server")();

const request = require("request");

const https = require("https");
const agent = new https.Agent({
  rejectUnauthorized: false
});

function* main() {
  // HTTP

  yield new Promise((resolve, reject) => {
    request("http://localhost:8081/ok", error => {
      if (error) reject(error);
      else resolve();
    });
  });

  yield new Promise((resolve, reject) => {
    request(
      "http://localhost:8081/ok",
      { method: "POST", body: "HELLO WORLD" },
      error => {
        if (error) reject(error);
        else resolve();
      }
    );
  });

  yield new Promise((resolve, reject) => {
    request("http://localhost:8081/ok", { method: "DELETE" }, error => {
      if (error) reject(error);
      else resolve();
    });
  });

  yield new Promise((resolve, reject) => {
    request("http://localhost:8081/redirect", error => {
      if (error) reject(error);
      else resolve();
    });
  });

  yield new Promise((resolve, reject) => {
    request("http://localhost:8081/not_found", error => {
      if (error) reject(error);
      else resolve();
    });
  });

  yield new Promise((resolve, reject) => {
    request("http://localhost:8081/close_without_response", error => {
      if (error && error.code !== "ECONNRESET") reject(error);
      else resolve();
    });
  });

  yield new Promise((resolve, reject) => {
    request("http://localhost:8081/corrupted", error => {
      if (error && error.code !== "HPE_INVALID_CONSTANT") reject(error);
      else resolve();
    });
  });

  // HTTPS

  yield new Promise((resolve, reject) => {
    request("https://localhost:8443/ok", { agent }, error => {
      if (error) reject(error);
      else resolve();
    });
  });

  yield new Promise((resolve, reject) => {
    request("https://localhost:8443/ok", { agent, method: "POST" }, error => {
      if (error) reject(error);
      else resolve();
    });
  });

  yield new Promise((resolve, reject) => {
    request("https://localhost:8443/ok", { agent, method: "DELETE" }, error => {
      if (error) reject(error);
      else resolve();
    });
  });

  yield new Promise((resolve, reject) => {
    request("https://localhost:8443/redirect", { agent }, error => {
      if (error) reject(error);
      else resolve();
    });
  });

  yield new Promise((resolve, reject) => {
    request("https://localhost:8443/not_found", { agent }, error => {
      if (error) reject(error);
      else resolve();
    });
  });

  yield new Promise((resolve, reject) => {
    request(
      "https://localhost:8443/close_without_response",
      { agent },
      error => {
        if (error && error.code !== "ECONNRESET") reject(error);
        else resolve();
      }
    );
  });

  yield new Promise((resolve, reject) => {
    request("https://localhost:8443/corrupted", { agent }, error => {
      if (error && error.code !== "HPE_INVALID_CONSTANT") reject(error);
      else resolve();
    });
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
