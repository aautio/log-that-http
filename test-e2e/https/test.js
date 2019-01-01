const close = require("../../test/server")();

const https = require("https");

function* main() {
  // HTTPS

  yield new Promise((resolve, reject) => {
    https
      .get(
        {
          hostname: "localhost",
          port: 8443,
          path: "/ok",
          rejectUnauthorized: false
        },
        res => {
          res.on("data", () => {
            // reading the stream to finish processing
          });
          res.on("end", resolve);
        }
      )
      .on("error", reject);
  });

  yield new Promise((resolve, reject) => {
    const req = https
      .request(
        {
          hostname: "localhost",
          port: 8443,
          path: "/ok",
          rejectUnauthorized: false,
          method: "POST"
        },
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
    https
      .request(
        {
          hostname: "localhost",
          port: 8443,
          path: "/ok",
          rejectUnauthorized: false,
          method: "DELETE"
        },
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
    https
      .get(
        {
          hostname: "localhost",
          port: 8443,
          path: "/redirect",
          rejectUnauthorized: false
        },
        res => {
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
        }
      )
      .on("error", reject);
  });

  yield new Promise((resolve, reject) => {
    https
      .get(
        {
          hostname: "localhost",
          port: 8443,
          path: "/not_found",
          rejectUnauthorized: false
        },
        res => {
          res.on("data", () => {
            // reading the stream to finish processing
          });
          res.on("end", () => {
            if (res.statusCode === 404) resolve();
            else reject();
          });
        }
      )
      .on("error", reject);
  });

  yield new Promise((resolve, reject) => {
    https
      .get(
        {
          hostname: "localhost",
          port: 8443,
          path: "/close_without_response",
          rejectUnauthorized: false
        },
        () => {
          reject("should ot receive response");
        }
      )
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
    https
      .get(
        {
          hostname: "localhost",
          port: 8443,
          path: "/corrupted",
          rejectUnauthorized: false
        },
        () => {
          reject("should ot receive response");
        }
      )
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
