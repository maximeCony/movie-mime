'use strict';

module.exports = function(io) {

  io.on('connection', function(socket) {

    var user = { roomId: null, socket: socket };
    
    socket.on('moviemime:room:join', function(params) {
      user.roomId = params.roomId;
      socket.join(params.roomId);
      user.socket.emit('room:joined', {
        roomId: user.roomId,
      });
    });

    socket.on('moviemime:signaling:hello', function(params) {
      // send user's peer id to users in the room
      socket.to(user.roomId)
        .broadcast.emit('moviemime:signaling:hello', params);
    });

  });

};
