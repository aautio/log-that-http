const close = require("../../test/server")();

const http = require("http");

function* main() {
  // HTTP

  yield new Promise((resolve, reject) => {
    http
      .get("http://localhost:8081/ok", res => {
        res.on("data", () => {
          // reading the stream to finish processing
        });
        res.on("end", resolve);
      })
      .on("error", reject);
  });

  yield new Promise((resolve, reject) => {
    const req = http
      .request(
        { host: "localhost", port: 8081, path: "/ok", method: "POST" },
        res => {
          res.on("data", () => {
            // reading the stream to finish processing
          });
          res.on("end", resolve);
        }
      )
      .on("error", reject);

    req.write("HELLO WORLD", () => {
      req.end();
    });
  });

  yield new Promise((resolve, reject) => {
    http
      .request(
        { host: "localhost", port: 8081, path: "/ok", method: "DELETE" },
        res => {
          res.on("data", () => {
            // reading the stream to finish processing
          });
          res.on("end", resolve);
        }
      )
      .on("error", reject)
      .end();
  });

  yield new Promise((resolve, reject) => {
    http
      .get("http://localhost:8081/redirect", res => {
        res.on("data", () => {
          // reading the stream to finish processing
        });
        res.on("end", () => {
          if (res.statusCode === 302) {
            resolve();
          } else {
            reject();
          }
        });
      })
      .on("error", reject);
  });

  yield new Promise((resolve, reject) => {
    http
      .get("http://localhost:8081/not_found", res => {
        res.on("data", () => {
          // reading the stream to finish processing
        });
        res.on("end", () => {
          if (res.statusCode === 404) resolve();
          else reject();
        });
      })
      .on("error", reject);
  });

  yield new Promise((resolve, reject) => {
    http
      .get("http://localhost:8081/close_without_response", () => {
        reject("should ot receive response");
      })
      .on("error", err => {
        // @ts-ignore
        if (err.code === "ECONNRESET") {
          resolve();
        } else {
          reject();
        }
      });
  });

  yield new Promise((resolve, reject) => {
    http
      .get("http://localhost:8081/corrupted", () => {
        reject("should ot receive response");
      })
      .on("error", err => {
        // @ts-ignore
        if (err.code === "HPE_INVALID_CONSTANT") resolve();
        else reject();
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
