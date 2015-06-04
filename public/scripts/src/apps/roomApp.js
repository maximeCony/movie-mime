'use strict';

window.$ = window.jQuery = require('jquery');

$(function() {

  var RoomView = require('../views/RoomView');
  
  var roomView = new RoomView(window.ROOM_ID, window.io());
  roomView.initialize();
});