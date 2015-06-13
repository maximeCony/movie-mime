'use strict';

module.exports = function (io) {

  io.on('connection', function (socket) {

    var user = { roomId: null, socket: socket };
    
    socket.on('moviemime:room:join', function (params) {
      user.roomId = params.roomId;
      socket.join(params.roomId);
      user.socket.emit('room:joined', {
        roomId: user.roomId,
      });
    });

    socket.on('moviemime:signaling:hello', function (params) {
      socket.to(user.roomId)
        .broadcast.emit('moviemime:signaling:hello', params);
    });

    socket.on('moviemime:video:play', function (params) {
      socket.to(user.roomId)
        .broadcast.emit('moviemime:video:play', params);
    });

    socket.on('moviemime:video:pause', function (params) {
      socket.to(user.roomId)
        .broadcast.emit('moviemime:video:pause', params);
    });

    socket.on('moviemime:video:timeupdate', function (params) {
      socket.to(user.roomId)
        .broadcast.emit('moviemime:video:timeupdate', params);
    });

  });

};
