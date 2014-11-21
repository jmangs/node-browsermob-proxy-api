var http = require('http');

var MobProxy = function(cfg) {
    this.host = (cfg && cfg.host) ? cfg.host : 'localhost';
    this.port = (cfg && cfg.port) ? cfg.port : '8080';
    this.debug = (cfg && cfg.debug) ? cfg.debug : false;
}

MobProxy.prototype = {
    getProxyList: function(callback) {
        this.call('GET', '/proxy', null, callback);
    },

    startPort: function(port, callback) {
        this.call('POST', '/proxy', 'port=' + port, callback);
    },

    stopPort: function(port, callback) {
        this.call('DELETE', '/proxy/' + port, null, callback);
    },

    createHAR: function(port, cfg, callback) {
        this.call('PUT', '/proxy/' + port + '/har', this.parameterize(cfg), callback);
    },

    startNewPage: function(port, pageRef, callback) {
        this.call('PUT', '/proxy/' + port + '/har/pageRef', pageRef ? pageRef : '', callback);
    },

    getHAR: function(port, callback) {
        this.call('GET', '/proxy/' + port + '/har', null, callback);
    },

    limit: function(port, cfg, callback) {
        this.call('PUT', '/proxy/' + port + '/limit', this.parameterize(cfg), callback);
    },

    addURLWhiteList: function(port, cfg, callback) {
        this.call('PUT', '/proxy/' + port + '/whitelist', this.parameterize(cfg), callback);
    },

    clearURLWhiteList: function(port, callback) {
        this.call('DELETE', '/proxy/' + port + '/whitelist', null, callback);
    },

    addURLBlackList: function(port, cfg, callback) {
        this.call('PUT', '/proxy/' + port + '/blacklist', this.parameterize(cfg), callback);
    },

    clearURLBlackList: function(port, callback) {
        this.call('DELETE', '/proxy/' + port + '/blacklist', null, callback);
    },

    setHeaders: function(port, json, callback) {
        this.call('POST', '/proxy/' + port + '/headers', json, callback, true);
    },

    setDNSLookupOverride: function(port, json, callback) {
        this.call('POST', '/proxy/' + port + '/hosts', json, callback, true);
    },

    setAuthentication: function(port, domain, json, callback) {
        this.call('POST', '/proxy/' + port + '/auth/basic/' + domain, json, callback, true);
    },

    setWaitPeriod: function(port, cfg, callback) {
        this.call('PUT', '/proxy/' + port + '/wait', this.parameterize(cfg), callback);
    },

    setTimeouts: function(port, cfg, callback) {
        this.call('PUT', '/proxy/' + port + '/timeout', this.parameterize(cfg), callback);
    },

    addURLRedirect: function(port, cfg, callback) {
        this.call('PUT', '/proxy/' + port + '/rewrite', this.parameterize(cfg), callback);
    },

    removeAllURLRedirects: function(port, callback) {
        this.call('DELETE', '/proxy/' + port + '/rewrite', null, callback);
    },

    setRetryCount: function(port, retryCount, callback) {
        this.call('PUT', '/proxy/' + port + '/retry', 'retryCount=' + retryCount, callback);
    },

    clearDNSCache: function(port, callback) {
        this.call('DELETE', '/proxy/' + port + '/dns/cache', null, callback);
    },

    addRequestInterceptor: function(port, payload, callback) {
        this.call('POST', '/proxy/' + port + '/interceptor/request', payload, callback);
    },

    addResponseInterceptor: function(port, payload, callback) {
        this.call('POST', '/proxy/' + port + '/interceptor/response', payload, callback);
    },

    parameterize: function(cfg) {
        var params = [];
        for(var key in cfg) {
            params.push(key + '=' + encodeURIComponent(cfg[key]));
        }

        return params.join('&');
    },

    call: function(method, url, data, callback, isJson) {
        var self = this;
	var contentType = isJson ? 'application/json' : 'application/x-www-form-urlencoded';
        var options = {
            host: this.host,
            port: this.port,
            method: method,
            path: url,
            headers: {
                'Content-Type': contentType,
                'Content-Length': data ? data.length : 0
            }
        };

        var respCallback = function(response) {
            var resp = '';
            response.on('data', function(chunk) { 
                resp += chunk;
            });

            response.on('end', function() {
                if(self.debug) { console.log(resp); }
                if(callback != undefined) { callback(null, resp); }
            });
        }

        var request = http.request(options, respCallback);
        if(data) { request.write(data); }
        request.end();
    }

}

module.exports = MobProxy;
