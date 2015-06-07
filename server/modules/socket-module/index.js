'use strict';

var io = require('socket.io'),
  http = require('http'),
  video = {
    users: {},
    startedAt: null,
    at: null,
  },
  allowedDifference = 0.7;

var requireUpdate = function(video, clientVideo) {
  var serverDifference = (video.startedAt / 1000) - video.at,
    clientDifference = (clientVideo.timestamp / 1000) - clientVideo.at,
    max = Math.max(serverDifference, clientDifference),
    min = Math.min(serverDifference, clientDifference),
    difference = max - min;
  return difference > allowedDifference;
};

module.exports = function(io) {

  io.on('connection', function(socket) {

    video.users[socket.id] = {
      socket: socket,
      username: null,
    };
    var user = video.users[socket.id];
    
    socket.on('disconnect', function() {
      delete video.users[socket.id];
    });

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

    // socket.on('moviemime:room:leave', function(params) {
    //   socket.leave(params.roomId);
    // });
    
    socket.on('moviemime:video:play', function(params) {
      video.startedAt = params.timestamp;
      video.at = params.at;
      socket.to(user.roomId).broadcast.emit('video:play', params.at);
    });
    
    socket.on('moviemime:video:pause', function() {
      socket.to(user.roomId).broadcast.emit('video:pause');
    });
    
    socket.on('moviemime:video:timeupdate', function(params) {
      if (requireUpdate(video, params)) {
        user.socket.emit('video:updatetime', params.at);
      }
    });

  });

};
