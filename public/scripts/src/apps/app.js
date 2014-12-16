'use strict';

$(function() {

  var AppRouter = require('../routers/app-router');

  var APP = window.APP = {
    models: {},
    collections: {},
    views: {},
    socket: io(),
  };

  APP.router = new AppRouter();
  APP.router.start();
});