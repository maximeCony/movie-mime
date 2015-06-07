'use strict';

var peer = require('./peer');
var room = require('./room');

var peers = module.exports = _.extend({
  
  connexions: [],

  emit: function (eventName, params) {
    peers.connexions.forEach(function (connexion) {
      connexion.send({
        eventName: eventName,
        params: params,
      });
    });
  },

}, Backbone.Events);

var peerInitialized = function () {
  room.socket.emit('moviemime:signaling:hello', {
    peerId: peer.id,
  }); 
};

var connectedToPeer = function (connexion) {
  peers.connexions.push(connexion);
  connexion.on('data', function (data) {
    // trigger the connexion event to the peers object
    peers.trigger(data.eventName, data.params);
  });
};

var connectToPeer = function (params) {
  var connexion = peer.connect(params.peerId);
  connexion
    .on('open', function () {
      connectedToPeer(connexion);
    });
};

/*
* Simple Mesh signaling
*/
peer.on('open', peerInitialized);
room.socket.on('moviemime:signaling:hello', connectToPeer);
peer.on('connection', connectedToPeer);
