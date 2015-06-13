'use strict';

var _ = require('lodash');

module.exports = function (io) {

  var rooms = {};

  io.on('connection', function (socket) {

    var user = {
      roomId: null, 
      socket: socket,
      attributes: null,
    };

    socket.on('disconnect', function () {
      if (rooms[user.roomId] && rooms[user.roomId][user.socket.id]) {
        delete rooms[user.roomId][user.socket.id];
        socket.to(user.roomId)
          .broadcast.emit('moviemime:room:deleteUser', user.socket.id);
      }
    });
    
    socket.on('moviemime:room:join', function (params) {
      user.roomId = params.roomId;
      user.attributes = params.userAttributes;
      user.attributes.id = user.socket.id;
      socket.join(user.roomId);
      if (!rooms[user.roomId]) rooms[user.roomId] = {};
      rooms[user.roomId][user.socket.id] = user;
      user.socket.emit('moviemime:room:joined', {
        users: _.map(rooms[user.roomId], function (user) {
          return user.attributes;
        })
      });
      socket.to(user.roomId)
        .broadcast.emit('moviemime:room:newUser', user.attributes);
    });

    socket.on('moviemime:set:user', function (params) {
      user.attributes = params;
      socket.to(user.roomId)
        .broadcast.emit('moviemime:set:user', params);
    });

    socket.on('moviemime:ring', function (params) {
      socket.to(user.roomId)
        .broadcast.emit('moviemime:ring', params);
    });

    socket.on('moviemime:video:play', function (params) {
      socket.to(user.roomId)
        .broadcast.emit('moviemime:video:play', params);
    });

    socket.on('moviemime:video:pause', function (params) {
      socket.to(user.roomId)
        .broadcast.emit('moviemime:video:pause', params);
    });

    socket.on('moviemime:video:seeked', function (params) {
      socket.to(user.roomId)
        .broadcast.emit('moviemime:video:updatetime', params);
    });

  });

};
