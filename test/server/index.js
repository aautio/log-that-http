const express = require("express");
const fs = require("fs");
const path = require("path");
const https = require("https");

const app = express();

/**
 * Faking a similar Date header to all requests. This way the response headers
 * should be identical and not time/date dependent.
 **/
app.use((req, res, next) => {
  res.setHeader("Date", new Date(0).toUTCString());
  return next();
});

app.get("/ok", (req, res) => {
  res.send("ALL OK OVER HERE");
});

app.post("/ok", (req, res) => {
  res.json({ message: "ALL IS FINE" });
});

app.delete("/ok", (req, res) => {
  res.sendStatus(200);
});

app.get("/redirect", (req, res) => {
  res.redirect("/ok");
});

app.get("/not_found", (req, res) => {
  res.sendStatus(404);
});

app.get("/close_without_response", req => {
  req.connection.destroy();
});

app.get("/corrupted", req => {
  req.connection.write("CORRUPTED CORRUPTED");
  req.connection.destroy();
});

const httpsOptions = {
  key: fs.readFileSync(path.join(__dirname, "key.pem")),
  cert: fs.readFileSync(path.join(__dirname, "cert.pem"))
};

function start() {
  const httpsServer = https.createServer(httpsOptions, app).listen(8443);

  const httpServer = app.listen(8081);

  return () => {
    httpServer.close();
    httpsServer.close();
  };
}

module.exports = start;
