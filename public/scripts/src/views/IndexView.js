'use strict';

module.exports = function () {

  return {

    initialize: function() {
      $('.js-createRoom')
        .on('click', this.createRoom.bind(this));
      return this;
    },

    createRoom: function () {
      $.ajax({
        url: '/api/rooms',
        type: 'POST',
        success: this.roomCreated.bind(this),
        error: function () {
          // TODO
          console.error('Something went wrong.');
        },
      }); 
    },

    roomCreated: function (room) {
      window.location.href = '/rooms/' + room.id;
    },

  };

};