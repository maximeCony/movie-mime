'use strict';

var peer = require('./peer');
var room = require('./room');
var calls = [];

navigator.getUserMedia = (
  navigator.getUserMedia || 
  navigator.webkitGetUserMedia || 
  navigator.mozGetUserMedia
);

var peers = module.exports = _.extend({
  
  connexions: [],
  
  calls: calls,

  emit: function (eventName, params) {
    peers.connexions.forEach(function (connexion) {
      connexion.send({
        eventName: eventName,
        params: params,
      });
    });
  },

  call: function () {
    peers.trigger('confirmCamAccess');
    var options = { video: true, audio: true };
    navigator.getUserMedia(options, function (stream) {
      peers.trigger('call:local', stream);
      peers.connexions.forEach(function (connexion) {
        // FIXME: use one connexion https://github.com/peers/peerjs/pull/132
        // also: https://github.com/peers/peerjs/issues/287
        // connexion.peerConnection.addStream(stream);
        var call = peer.call(connexion.peer, stream);
        call.on('stream', function (remoteStream) {
          peers.trigger('call:remote', remoteStream);
        });
        calls.push(call);
      });
    }, function (err) {
      console.log(err);
    });
  },

  hangup: function () {
    peers.calls.forEach(function (call) {
      call.close();
    });
  },

}, Backbone.Events);

var peerInitialized = function () {
  room.socket.emit('moviemime:signaling:hello', {
    peerId: peer.id,
  }); 
};

var connectedToPeer = function (connexion) {
  peers.trigger('connexion:connected');
  peers.connexions.push(connexion);
  connexion.on('data', function (data) {
    // trigger the connexion event to the peers object
    peers.trigger(data.eventName, data.params);
  });
  connexion.on('stream', function (remoteStream) {
    peers.trigger('call:remote', remoteStream);
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

// on call
peer.on('call', function (call) {
  peers.trigger('confirmCamAccess');
  var options = { video: true, audio: true };
  navigator.getUserMedia(options, function (stream) {
    peers.trigger('call:local', stream);
    calls.push(call);
    call.answer(stream);
    call.on('stream', function (remoteStream) {
      peers.trigger('call:remote', remoteStream);
    });
  }, console.error);
});
