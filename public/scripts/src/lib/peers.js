'use strict';

var room = require('./room');
navigator.getUserMedia = (
  navigator.getUserMedia || 
  navigator.webkitGetUserMedia || 
  navigator.mozGetUserMedia
);

module.exports = function () {

  var parser = document.createElement('a');
  parser.href = window.location.href;
  var peerOptions = {
    debug: 3,
    host: '/',
    port: parser.port || '',
    path: '/peerjs',
    secure: parser.protocol === 'https:',
    config: { 
      iceServers: [
        { url: 'stun:stun.l.google.com:19302' },
        { url: 'stun:stun1.l.google.com:19302' },
        { 
          url: 'turn:numb.viagenie.ca', 
          username: 'maxime.cony@gmail.com',
          credential: 'Vy2UzSJoLq',
        },
      ], 
    },
  };
  var mediaStreamConstaints = {
    audio: true,
    video: {
      mandatory: { maxHeight: 150 },
    },
  };

  return _.extend({

    _peer: undefined,

    _call: undefined,

    initEvents: function () {
      room.socket.on('moviemime:ring', this.ringReceived.bind(this));
    },

    ring: function () {
      var me = this;
      this.trigger('moviemime:camera:required:ring');
      navigator.getUserMedia(mediaStreamConstaints, function (stream) {
        me.trigger('moviemime:camera:granted:ring', stream);
        me.localMediaStream = stream;
        me.peer = new window.Peer(peerOptions);
        me.peer
          .on('open', function (peerId) {
            room.socket.emit('moviemime:ring', {
              peerId: peerId,
            });
          })
          .on('call', function (call) {
            call.answer(me.localMediaStream);
            me._call = call;
          });
      }, this.trigger.bind(this, 'moviemime:ring:camera:denied'));
    },

    ringReceived: function (params) {
      var me = this;
      this.peer = new window.Peer(peerOptions);
      this.peer.on('open', function () {
        me.trigger('moviemime:camera:required:answer');
        navigator.getUserMedia(mediaStreamConstaints, function (stream) {
          me.trigger('moviemime:camera:granted:answer', stream);
          me.localMediaStream = stream;
          me._call = me.peer.call(params.peerId, stream);
          me._call.on('stream', function (remoteStream) {
            me.trigger('moviemime:camera:received', remoteStream);
          });
        });
      });
    },

    hangup: function () {
      this._call.close();
    },

  }, Backbone.Events);

};
