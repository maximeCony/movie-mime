'use strict';

var animateGrowClassTimeout;
var parser = document.createElement('a');
parser.href = window.location.href;

module.exports = {

  heartBeat: function() {
    var $heart = $('.heart');
    $heart.addClass('animate-grow');
    if (animateGrowClassTimeout) {
      clearTimeout(animateGrowClassTimeout);
    }
    animateGrowClassTimeout = setTimeout(function() {
      $heart.removeClass('animate-grow');
    }, 200);
  },

  serializeForm: function($from) {
    return _.object(
      _.map($from.serializeArray(), function(object) {
        return [
          object.name, 
          object.value === '' ? null : object.value,
        ];
      })
    );
  },

  getMediaStreamConstaints: function () {
    return {
      audio: true,
      video: {
        mandatory: { maxHeight: 150 },
      },
    };
  },

  getPeerOptions: function () {
    return {
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
  },

};