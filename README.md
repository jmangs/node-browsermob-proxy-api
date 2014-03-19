# Node BrowserMob Proxy API

This project provides a NodeJS interface for interacting with a running BrowserMob Proxy through it's REST API. All methods in the REST API are available including JavaScript-based interceptors for requests/responses.

## Usage

Installation command is ```npm install browsermob-proxy-api```

## Documentation

For the specifics of the REST API used by BrowserMob Proxy, please see [documentation](https://github.com/lightbody/browsermob-proxy/blob/master/README.md).

### Examples
To open a port (10800) and start a new HAR:
```javascript
var MobProxy = require('browsermob-proxy-api');
var proxy = new MobProxy({'host':'localhost', 'port': '8080'});

// start listening on port 10800:
proxy.startPort(10800, function(err, data) {
    // start new HAR report
    proxy.createHAR(10800, { 'initialPageRef': 'foo' });
});
```

To get the current HAR from a previously opened port:
```javascript
proxy.getHAR(10800, function(err, data) {
    console.log(data);
});
```
