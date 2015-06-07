'use strict';

window.$ = window.jQuery = require('jquery');

$(function() {

  window.bootstrap = require('bootstrap');
  window._ = require('lodash');
  window.Backbone = require('backbone');
  window.Backbone.$ = $;

  var RoomView = require('../views/RoomView');
  var roomView = new RoomView();
  roomView.initialize();
});