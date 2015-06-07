'use strict';

window.$ = window.jQuery = require('jquery');

$(function() {

  var signaling = require('../lib/signaling');
  signaling.initialize();

  // var RoomView = require('../views/RoomView');
  // var roomView = new RoomView();
  // roomView.initialize();
});