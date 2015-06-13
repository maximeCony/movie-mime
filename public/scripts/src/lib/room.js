'use strict';

var socket = window.io();
socket.emit('moviemime:room:join', {
  roomId: window.ROOM_ID,
  userAttributes: {
    name: require('shortid').generate(),
  }
});

socket.on('moviemime:room:joined', function (params) {
  console.log(params);
});

socket.on('moviemime:romm:newUser', function (params) {
  console.log(params);
});

module.exports = {
  socket: socket,
  id: window.ROOM_ID,
};