# log-that-http

Logs _outgoing_ http requests and responses from Node.js.

## Features

- Writes each outgoing request and response to `console.log`
- request and response headers can be included
- request body can be included
- Zero dependencies
- Wide support for popular request libraries
- Node.js supported from version 8 upwards

## Demo

```
npm install log-that-http axios node-fetch

node --require log-that-http -e "const axios=require('axios').default; axios.get('http://www.google.com');"

LOG_THAT_HTTP_HEADERS=true node --require log-that-http -e "const fetch=require('node-fetch').default; fetch('http://www.github.com');"
```

## Usage

`node --require log-that-http foo.js` or use `require('log-that-http')` from within your script.

Use the following environment variables to add more info:

- `LOG_THAT_HTTP_HEADERS=true` to log all request and response headers.
- `LOG_THAT_HTTP_BODY=true` to log request bodies.

## Compatibility

`log-that-http` is compatible with the popular request libraries and the built-in `http` and `https`-modules.

- [axios](https://www.npmjs.com/package/axios)
- [got](https://www.npmjs.com/package/got)
- [node-fetch](https://www.npmjs.com/package/node-fetch)
- [request](https://www.npmjs.com/package/request)
- [superagent](https://www.npmjs.com/package/superagent)
- [`http.get()` and `http.request()`](https://nodejs.org/api/http.html)
- [`https.get()` and `https.request()`](https://nodejs.org/api/https.html)

Compatibility with Node.js versions from 8 to 11 is tested with the help of `npx` & [node](https://www.npmjs.com/package/node).

Missing something? Please file an issue.
