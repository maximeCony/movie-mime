'use strict';

module.exports = new Peer({ 
  key: 'f8ks1iddocvoyldi',
  debug: 3,
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