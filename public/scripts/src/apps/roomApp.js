'use strict';

window.$ = window.jQuery = require('jquery');

$(function() {

  window.dust = require('dustjs-linkedin');
  window.bootstrap = require('bootstrap');
  window._ = require('lodash');
  window.Backbone = require('backbone');
  window.Backbone.$ = $;

  var RoomView = require('../views/room/RoomView');
  var AlertView = require('../views/components/AlertView');

  /* 
  * load precompiled Dust templates 
  * from (/scripts/dist/templates/templates.js)
  */
  window.LOAD_DUST_TEMPATES();

  navigator.getUserMedia = (
    navigator.getUserMedia || 
    navigator.webkitGetUserMedia || 
    navigator.mozGetUserMedia
  );

  window.APP = {
    socket: window.io({ reconnection: true }),
    user: {},
    views: {},
    collections: {
      users: new Backbone.Collection(),
    },
  };

  var $alerts = $('.alerts');
  APP.alert = function (message, type) {
    var view = new AlertView({
      message: message,
      type: type,
    });
    $alerts.append(view.render().$el);
  };

  APP.views.roomView = new RoomView();
  APP.views.roomView.start();
});
