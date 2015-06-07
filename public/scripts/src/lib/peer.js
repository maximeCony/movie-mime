'use strict';

var parser = document.createElement('a');
parser.href = window.location.href;

module.exports = new Peer({
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
  }
});