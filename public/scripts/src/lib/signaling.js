'use strict';

var peer = require('./peer');
var room = require('./room');
var connexions = {};

navigator.getUserMedia = (
  navigator.getUserMedia || 
  navigator.webkitGetUserMedia || 
  navigator.mozGetUserMedia
);

var peerInitialized = function () {
  console.log('send hello');
  room.socket.emit('moviemime:signaling:hello', {
    peerId: peer.id,
  }); 
};

var connectToPeer = function (params) {
  console.log('received hello', params);
  connexions[params.peerId] = peer.connect(params.peerId);
  connexions[params.peerId]
    .on('open', function () {
      connexions[params.peerId].send('hi!');
    });
};

var connectedToPeer = function (connexion) {
  connexion.on('data', function (data) {
    console.log(data);
  });
};

module.exports = {

  /*
  * Simple Mesh signaling
  */
  initialize: function () {
    peer.on('open', peerInitialized);
    room.socket.on('moviemime:signaling:hello', connectToPeer);
    peer.on('connection', connectedToPeer);
  },

};