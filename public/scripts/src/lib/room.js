'use strict';

var socket = window.io();
socket.emit('moviemime:room:join', { roomId: window.ROOM_ID });

module.exports = {
  socket: socket,
  id: window.ROOM_ID,
};