'use strict';

var redis = require('redis');
var env = require('require-env');
var REDIS_CONFIG = env.requireUrl(env.require('REDIS_URL_VAR'));
var port = REDIS_CONFIG.port;
var hostname = REDIS_CONFIG.hostname;
var pass = REDIS_CONFIG.pass;
var client = redis.createClient(port, hostname, {
  connect_timeout: 1000 * 7,
});

client.auth(pass);

module.exports = client;