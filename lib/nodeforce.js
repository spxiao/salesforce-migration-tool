/* Module dependencies */

var soap = require('soap');
var path = require('path');


/* Constants */

var API_VERSIONS = ['20.0', '21.0', '22.0', '23.0', '24.0', '25.0', '26.0', '27.0', '28.0', '29.0'];


/* Constructor */

var Client = function(opts) {
  if (opts == null) {
    opts = {};
  }
  this.apiVersion = opts.apiVersion || 29.0;
  this.username = opts.username || '';
  this.password = opts.password || '';
  this.endpoint = opts.endpoint || 'login.salesforce.com';
  if (!~this.endpoint.indexOf('https')) {
    this.endpoint = "https://" + this.endpoint;
  }
  if (!~this.endpoint.indexOf('/services')) {
    this.endpoint += '/services/Soap/u/29.0';
  }
  this.sid = opts.sid || '';
  this.userId = opts.userId || '';
  this.overrideSessionCheck = opts.overrideSessionCheck || false;
}


/* Partner API calls */

Client.prototype.login = function(opts, callback) {
  var _ref;
  _ref = this.cleanOptions(opts, callback), opts = _ref[0], callback = _ref[1];
  if (this.sid !== '') {
    return this.fromSession(callback);
  }
  opts.username = opts.username || this.username;
  opts.password = opts.password || this.password;
  this.endpoint = opts.endpoint || this.endpoint;
  delete opts.endpoint;
  this.client('partner', (function(_this) {
    return function(err, client) {
      return _this.performCall(client, 'login', opts, function(err, response, lastRequest) {
        if (err) {
          return callback(err);
        }
        _this._sessionResponse = response;
        if (response.result != null) {
          _this.sid = response.result.sessionId || '';
          _this.userId = response.result.userId || '';
          _this.endpoint = response.result.serverUrl;
          client.setEndpoint(_this.endpoint);
        }
        return callback(err, response, lastRequest);
      });
    };
  })(this));
};

Client.prototype.getUserInfo = function(callback) {
  this.client('partner', (function(_this) {
    return function(err, client) {
      return _this.performCall(client, 'getUserInfo', null, callback);
    };
  })(this));
};

Client.prototype.query = function(opts, callback) {
  var _ref;
  _ref = this.cleanOptions(opts, callback), opts = _ref[0], callback = _ref[1];
  this.client('partner', (function(_this) {
    return function(err, client) {
      return _this.performCall(client, 'query', opts, callback);
    };
  })(this));
};


/* Apex API calls */

Client.prototype.compileApex = function(opts, callback) {
  var type, _ref;
  _ref = this.cleanOptions(opts, callback), opts = _ref[0], callback = _ref[1];
  type = opts.type === 'ApexTrigger' ? 'compileTriggers' : 'compileClasses';
  delete opts.type;
  opts.scripts = opts.scripts || '';
  this.client('apex', (function(_this) {
    return function(err, client) {
      return _this.performCall(client, type, opts, callback);
    };
  })(this));
};

Client.prototype.executeApex = function(opts, callback) {
  var debug, _ref, _ref1;
  _ref = this.cleanOptions(opts, callback), opts = _ref[0], callback = _ref[1];
  _ref1 = this.prepareDebugHeader(opts), opts = _ref1[0], debug = _ref1[1];
  opts.apexcode = opts.apexcode || '';
  this.client('apex', (function(_this) {
    return function(err, client) {
      return _this.performCall(client, 'executeAnonymous', opts, callback, debug);
    };
  })(this));
};

Client.prototype.runTests = function(opts, callback) {
  var debug, _ref, _ref1;
  _ref = this.cleanOptions(opts, callback), opts = _ref[0], callback = _ref[1];
  _ref1 = this.prepareDebugHeader(opts), opts = _ref1[0], debug = _ref1[1];
  opts.namespace = opts.namespace || '';
  this.client('apex', (function(_this) {
    return function(err, client) {
      return _this.performCall(client, 'runTests', {
        request: opts
      }, callback, debug);
    };
  })(this));
};


/* MetaData API calls */

Client.prototype.retrieve = function(opts, callback) {
  var _ref;
  _ref = this.cleanOptions(opts, callback), opts = _ref[0], callback = _ref[1];
  if (opts.wait) {
    delete opts.wait;
    callback = this.createCheckStatus(callback, 'checkRetrieveStatus');
  }
  this.client('metadata', (function(_this) {
    return function(err, client) {
      return _this.performCall(client, 'retrieve', {
        retrieveRequest: opts
      }, callback);
    };
  })(this));
};

Client.prototype.checkRetrieveStatus = function(opts, callback) {
  var _ref;
  _ref = this.cleanOptions(opts, callback), opts = _ref[0], callback = _ref[1];
  this.client('metadata', (function(_this) {
    return function(err, client) {
      return _this.performCall(client, 'checkRetrieveStatus', opts, callback);
    };
  })(this));
};

Client.prototype.deploy = function(opts, callback) {
  var _ref;
  _ref = this.cleanOptions(opts, callback), opts = _ref[0], callback = _ref[1];
  if (opts.wait) {
    delete opts.wait;
    callback = this.createCheckStatus(callback, 'checkDeployStatus');
  }
  this.client('metadata', (function(_this) {
    return function(err, client) {
      return _this.performCall(client, 'deploy', opts, callback);
    };
  })(this));
};

Client.prototype.checkDeployStatus = function(opts, callback) {
  var _ref;
  _ref = this.cleanOptions(opts, callback), opts = _ref[0], callback = _ref[1];
  this.client('metadata', (function(_this) {
    return function(err, client) {
      return _this.performCall(client, 'checkDeployStatus', opts, callback);
    };
  })(this));
};

Client.prototype.describe = function(opts, callback) {
  var _ref;
  _ref = this.cleanOptions(opts, callback), opts = _ref[0], callback = _ref[1];
  opts.apiVersion = opts.apiVersion || this.apiVersion;
  this.client('metadata', (function(_this) {
    return function(err, client) {
      return _this.performCall(client, 'describeMetadata', opts, callback);
    };
  })(this));
};

Client.prototype.list = function(opts, callback) {
  var _ref;
  _ref = this.cleanOptions(opts, callback), opts = _ref[0], callback = _ref[1];
  opts.asOfVersion = parseFloat(opts.asOfVersion || this.apiVersion).toFixed(1);
  this.client('metadata', (function(_this) {
    return function(err, client) {
      return _this.performCall(client, 'listMetadata', opts, callback);
    };
  })(this));
};


/* Public Helper Methods */

Client.prototype.checkStatus = function(opts, callback) {
  var _ref;
  _ref = this.cleanOptions(opts, callback), opts = _ref[0], callback = _ref[1];
  this.client('metadata', (function(_this) {
    return function(err, client) {
      return _this.performCall(client, 'checkStatus', opts, callback);
    };
  })(this));
};


/* Private Helper Methods */

Client.prototype.createCheckStatus = function(callback, checkMethodName) {
  var checkStatus;
  return checkStatus = (function(_this) {
    return function(err, response, request) {
      if (err) {
        return callback(err);
      }
      if (Array.isArray(response.result)) {
        response.result = response.result[0];
      }
      if (response.result.done) {
        return _this[checkMethodName]({
          id: response.result.id
        }, callback);
      }
      return process.nextTick(function() {
        return _this.checkStatus({
          ids: [response.result.id]
        }, checkStatus);
      });
    };
  })(this);
};

Client.prototype.fromSession = function(callback) {
  if (this.endpoint && this.sid && this.userId && this._sessionResponse) {
    return callback(null, this._sessionResponse);
  } else {
    return this.client('partner', (function(_this) {
      return function(err, client) {
        client.soapHeaders = [];
        client.addSoapHeader(_this.getSoapHeader(), null, 'tns');
        return client.getUserInfo(function(err, response) {
          if (err) {
            return callback(err);
          }
          _this.userId = response.result.userId;
          return callback(err, _this._sessionResponse = response);
        });
      };
    })(this));
  }
};

Client.prototype.performCall = function(client, method, opts, callback, debugHeader) {
  if (debugHeader == null) {
    debugHeader = false;
  }
  if (!this.userId && this.endpoint && this.sid) {
    return this.fromSession((function(_this) {
      return function(err, response) {
        if (err) {
          return callback(err);
        }
        return _this.performCall(client, method, opts, callback, debugHeader);
      };
    })(this));
  }
  client.soapHeaders = [];
  if (this.sid) {
    client.addSoapHeader(this.getSoapHeader(), null, 'tns');
  }
  if (debugHeader) {
    client.addSoapHeader(debugHeader, null, 'tns');
  }
  client[method](opts, (function(_this) {
    return function(err, response, body) {
      var header;
      if (!err) {
        header = client.wsdl.xmlToObject(body).Header;
      }
      return callback(err, response, client.lastRequest, header || {});
    };
  })(this));
};

Client.prototype.getSoapHeader = function() {
  return {
    SessionHeader: {
      sessionId: this.sid
    }
  };
};

Client.prototype.prepareDebugHeader = function(opts) {
  var debug;
  debug = {
    DebuggingHeader: {
      debugLevel: opts.debugLevel || 'Debugonly',
      categories: opts.categories || [
        {
          category: 'Apex_code',
          level: 'Debug'
        }
      ]
    }
  };
  delete opts.categories;
  delete opts.debugLevel;
  return [opts, debug];
};

Client.prototype.cleanOptions = function(opts, callback) {
  if (typeof opts === 'function') {
    callback = opts;
    opts = {};
  }
  return [opts, callback];
};

Client.prototype.client = function(type, callback) {
  var repl, wsdl;
  if (this["_" + type + "Client"]) {
    return callback(null, this["_" + type + "Client"]);
  }
  wsdl = path.resolve(__dirname, "./wsdl/" + (this.apiVersion.toFixed(1)) + "/" + type + ".wsdl");
  switch (type) {
    case 'metadata':
      repl = '/m/';
      break;
    case 'apex':
      repl = '/s/';
      break;
    default:
      repl = '/u/';
  }
  return soap.createClient(wsdl, (function(_this) {
    return function(err, client) {
      client.setEndpoint(_this.endpoint.replace(/\/u\//, repl));
      _this["_" + type + "Client"] = client;
      return callback(err, client);
    };
  })(this));
};


/* Exports */

module.exports.createClient = function(opts) {
  return new Client(opts);
}