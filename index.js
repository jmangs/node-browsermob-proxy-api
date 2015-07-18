var http = require('http');

function formEncode(params) {
    if (!params) {
        return '';
    }
    return Object.keys(params).map(function(key) {
        var value = params[key] || '';
        return encodeURIComponent(key) + '=' + encodeURIComponent(value);
    }).join('&');
}

var JSON_MIME = 'application/json';
var JAVASCRIPT_MIME = 'application/javascript';
var FORM_MIME = 'application/x-www-form-urlencoded';

var MobProxy = function(cfg) {
    cfg = cfg || {};
    this.host = cfg.host || 'localhost';
    this.port = cfg.port || '8080';
    this.debug = cfg.debug || false;
};

MobProxy.prototype = {
    getProxyList: function(callback) {
        this._get('/proxy', callback);
    },

    startPort: function(params, callback) {
        if (typeof params === 'number') { // for compatibility with previous interface
            params = {'port': params.toString()};
        }
        this._post('/proxy', formEncode(params), FORM_MIME, callback);
    },

    stopPort: function(port, callback) {
        this._delete('/proxy/' + port, callback);
    },

    createHAR: function(port, params, callback) {
        this._put('/proxy/' + port + '/har', formEncode(params), FORM_MIME, callback);
    },

    startNewPage: function(port, params, callback) {
        if (typeof params === 'string') { // for compatibility with previous interface
            params = {'pageRef': params};
        }
        this._put('/proxy/' + port + '/har/pageRef', formEncode(params), FORM_MIME, callback);
    },

    getHAR: function(port, callback) {
        this._get('/proxy/' + port + '/har', callback);
    },

    getLimit: function(port, callback) {
        this._get('/proxy/' + port + '/limit', callback);
    },

    setLimit: function(port, params, callback) {
        this._put('/proxy/' + port + '/limit', formEncode(params), FORM_MIME, callback);
    },

    limit: function() {
        this.setLimit.apply(this, arguments);
    },

    getURLWhiteList: function(port, callback) {
        this._get('/proxy/' + port + '/whitelist', callback);
    },

    addURLWhiteList: function(port, params, callback) {
        this._put('/proxy/' + port + '/whitelist', formEncode(params), FORM_MIME, callback);
    },

    clearURLWhiteList: function(port, callback) {
        this._delete('/proxy/' + port + '/whitelist', callback);
    },

    getURLBlackList: function(port, callback) {
        this._get('/proxy/' + port + '/blacklist', callback);
    },

    addURLBlackList: function(port, params, callback) {
        this._put('/proxy/' + port + '/blacklist', formEncode(params), FORM_MIME, callback);
    },

    clearURLBlackList: function(port, callback) {
        this._delete('/blacklist', callback);
    },

    setHeaders: function(port, json, callback) {
        if (typeof json === 'object') {
            json = JSON.stringify(json);
        }
        this._post('/proxy/' + port + '/headers', json, JSON_MIME, callback);
    },

    setDNSLookupOverride: function(port, json, callback) {
        if (typeof json === 'object') {
            json = JSON.stringify(json);
        }
        this._post('/proxy/' + port + '/hosts', json, JSON_MIME, callback);
    },

    setAuthentication: function(port, domain, json, callback) {
        if (typeof json === 'object') {
            json = JSON.stringify(json);
        }
        this._post('/proxy/' + port + '/auth/basic/' + domain, json, JSON_MIME, callback);
    },

    setWaitPeriod: function(port, params, callback) {
        this._put('/proxy/' + port + '/wait', formEncode(params), FORM_MIME, callback);
    },

    setTimeouts: function(port, params, callback) {
        this._put('/proxy/' + port + '/timeout', formEncode(params), FORM_MIME, callback);
    },

    addURLRedirect: function(port, params, callback) {
        this._put('/proxy/' + port + '/rewrite', formEncode(params), FORM_MIME, callback);
    },

    removeAllURLRedirects: function(port, callback) {
        this._delete('/proxy/' + port + '/rewrite', callback);
    },

    setRetryCount: function(port, retryCount, callback) {
        this._put('/proxy/' + port + '/retry', formEncode({'retrycount': retryCount}), FORM_MIME, callback);
    },

    clearDNSCache: function(port, callback) {
        this._delete('/proxy/' + port + '/dns/cache', callback);
    },

    addRequestInterceptor: function(port, js, callback) {
        this._post('/proxy/' + port + '/interceptor/request', js, JAVASCRIPT_MIME, callback);
    },

    addResponseInterceptor: function(port, js, callback) {
        this._post('/proxy/' + port + '/interceptor/response', js, JAVASCRIPT_MIME, callback);
    },
    // INTERNAL METHODS
    _get: function(path, callback) {
        this._call('GET', path, callback);
    },
    _post: function(path, payload, mimeType, callback) {
        this._call('POST', path, payload, mimeType, callback);
    },
    _put: function(path, payload, mimeType, callback) {
        this._call('PUT', path, payload, mimeType, callback);
    },
    _delete: function(path, callback) {
        this._call('DELETE', path, callback);
    },
    _call: function(method, url, data, mimeType, callback) {
        if (arguments.length === 3) {
            callback = data;
            data = undefined;
        }
        var self = this;
        var options = {
            host: this.host,
            port: this.port,
            method: method,
            path: url
        };
        if (data) {
            options.headers = {
                'Content-Type': mimeType,
                'Content-Length': data.length
            };
        }

        var respCallback = function(response) {
            var resp = '';
            response.on('data', function(chunk) {
                resp += chunk;
            });

            response.on('end', function() {
              var err = null;
                if (response.statusCode >= 400) {
                  err = new Error('Error from server: ' + response.statusCode);
                  resp = undefined;
                }
                if(self.debug && resp) { console.log(resp); }
                if(callback !== undefined) { callback(err, resp); }
            });
        };

        var request = http.request(options, respCallback);
        if(data) { request.write(data); }
        request.end();
    }

};

module.exports = MobProxy;
