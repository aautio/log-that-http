const close = require("../../test/server")();

const request = require("superagent");

function* main() {
  // HTTP

  yield request.get("http://localhost:8081/ok");
  yield request.post("http://localhost:8081/ok").send("HELLO WORLD");
  yield request.delete("http://localhost:8081/ok");

  yield request.get("http://localhost:8081/redirect");
  yield request.get("http://localhost:8081/not_found").ok(res => res.status === 404)
  
  yield request
    .get("http://localhost:8081/close_without_response")
    .catch(err => {
      if (err.code === "ECONNRESET") {
        // this was expected
      } else {
        throw err;
      }
    });
  yield request.get("http://localhost:8081/corrupted").catch(err => {
    if (err.code === "HPE_INVALID_CONSTANT") {
      // this was expected
    } else {
      throw err;
    }
  });

  // HTTPS

  yield request.get("https://localhost:8443/ok").trustLocalhost();

  yield request.post("https://localhost:8443/ok").trustLocalhost();

  yield request.delete("https://localhost:8443/ok").trustLocalhost();

  yield request.get("https://localhost:8443/redirect").trustLocalhost();

  yield request
    .get("https://localhost:8443/not_found").trustLocalhost().ok(res => res.status === 404)

  yield request
    .get("https://localhost:8443/close_without_response").trustLocalhost()
    .catch(err => {
      if (err.code === "ECONNRESET") {
        // this was expected
      } else {
        throw err;
      }
    });

  yield request
    .get("https://localhost:8443/corrupted").trustLocalhost()
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
