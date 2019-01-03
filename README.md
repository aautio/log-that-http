# log-that-http

Logs _outgoing_ http requests and responses from Node.js.

## Features

- Writes each outgoing request and response to `console.log`
- request and response headers can be included in the logs
- request body can be included in the logs
- Supports your favourite request library
- No dependencies
- Lots of tests

## Demo

```
npm install log-that-http axios node-fetch

node --require log-that-http -e "const axios=require('axios').default; axios.get('http://www.google.com');"

LOG_THAT_HTTP_HEADERS=true node --require log-that-http -e "const fetch=require('node-fetch').default; fetch('http://www.github.com');"
```

## Usage

To log each outgoing http request and response `node --require log-that-http foo.js`. You can also `require('log-that-http')` from within your script.

Use the following environment variables to add more info:

- LOG_THAT_HTTP_HEADERS - if `true` then all request and response headers are logged.
- LOG_THAT_HTTP_BODY - if `true` then request bodies are logged.

## Compatibility

`log-that-http` is compatible with the popular request libraries and the built-in `http` and `https`-modules.

- [axios](https://www.npmjs.com/package/axios)
- [node-fetch](https://www.npmjs.com/package/node-fetch)
- [request](https://www.npmjs.com/package/request)
- [`http.get()` and `http.request()`](https://nodejs.org/api/http.html)
- [`https.get()` and `https.request()`](https://nodejs.org/api/https.html)

Compatibility with Node.js versions from 8 to 11 are supported with the help of `npx` & [node](https://www.npmjs.com/package/node).

Missing something? Please file an issue.
