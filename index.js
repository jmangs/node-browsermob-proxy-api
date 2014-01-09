var http = require('http');

var MobProxy = function(cfg) {
    this.host = (cfg && cfg.host) ? cfg.host : 'localhost';
    this.port = (cfg && cfg.port) ? cfg.port : '8080';

    //TODO: add browsermob-proxy config parameters here

    this.debug = (cfg && cfg.debug) ? cfg.debug : false;
}

MobProxy.prototype = {
    getProxyList: function() {
        return this.call('GET', '/proxy', null);
    },

    startPort: function(port) {
        this.call('PUT', '/proxy', 'port=' + port);
    },

    stopPort: function(port) {
        this.call('DELETE', '/proxy/' + port, null);
    },

    createHAR: function(port, cfg) {
        return this.call('PUT', '/proxy/' + port + '/har', parameterize(cfg));
    },

    startNewPage: function(port, pageRef) {
        this.call('PUT', '/proxy/' + port + '/har/pageRef', pageRef ? pageRef : '');
    },

    getHAR: function(port) {
        return this.call('GET', '/proxy/' + port + '/har', null);
    },

    limit: function(port, cfg) {
        this.call('PUT', '/proxy/' + port + '/limit', parameterize(cfg));
    },

    addURLWhiteList: function(port, cfg) {
        this.call('PUT', '/proxy/' + port + '/whitelist', parameterize(cfg));
    },

    clearURLWhiteList: function(port) {
        this.call('DELETE', '/proxy/' + port + '/whitelist', null);
    },

    addURLBlackList: function(port, cfg) {
        this.call('PUT', '/proxy/' + port + '/blacklist', parameterize(cfg));
    },

    clearURLBlackList: function(port) {
        this.call('DELETE', '/proxy/' + port + '/blacklist', null);
    },

    setHeaders: function(port, json) {
        this.call('POST', '/proxy/' + port + '/headers', json);
    },

    setDNSLookupOverride: function(port, json) {
        this.call('POST', '/proxy/' + port + '/hosts', json);
    },

    setAuthentication: function(port, domain, json) {
        this.call('POST', '/proxy/' + port + '/auth/basic/' + domain, json);
    },

    setWaitPeriod: function(port, cfg) {
        this.call('PUT', '/proxy/' + port + '/wait', parameterize(cfg));
    },

    setTimeouts: function(port, cfg) {
        this.call('PUT', '/proxy/' + port + '/timeout', parameterize(cfg));
    },

    addURLRedirect: function(port, cfg) {
        this.call('PUT', '/proxy/' + port + '/rewrite', parameterize(cfg));
    },

    removeAllURLRedirects: function(port) {
        this.call('DELETE', '/proxy/' + port + '/rewrite', null);
    },

    setRetryCount: function(port, retryCount) {
        this.call('PUT', '/proxy/' + port + '/retry', 'retryCount=' + retryCount);
    },

    clearDNSCache: function(port) {
        this.call('DELETE', '/proxy/' + port + '/dns/cache', null);
    },

    addRequestInterceptor: function(port, payload) {
        this.call('POST', '/proxy/' + port + '/interceptor/request', payload);
    },

    addResponseInterceptor: function(port, payload) {
        this.call('POST', '/proxy/' + port + '/interceptor/response', payload);
    },

    parameterize: function(cfg) {
        var params = [];
        for(var key in cfg) {
            params.push(key + '=' + encodeURIComponent(cfg[key]));
        }

        return params.join('&');
    },

    call: function(method, url, data) {
        var self = this;
        var response = '';
        var options = {
            host: this.host,
            port: this.port,
            path: url,
            method: method
        };

        var callback = function(response) {
            response.on('data', function(chunk) { 
                resp += chunk;
            });

            response.on('end', function() {
                if(self.debug) {
                    console.log(resp);
                }
            });
        }

        var request = http.request(options, callback);
        if(data) { request.write(data); }
        request.end();

        return response;
    }

}

module.exports = {
    MobProxy: MobProxy
};
