'use strict';

module.exports = function () {

  return {

    initialize: function() {
      $('.js-createRoom')
        .on('click', this.createRoom.bind(this));
      return this;
    },

    createRoom: function (e) {
      $.ajax({
        url: '/api/rooms',
        type: 'POST',
        error: function () {
          // TODO
          console.error('Something went wrong.');
        },
        success: function (room) {
          var openInNewTab = (e.ctrlKey || 
            e.shiftKey || 
            e.metaKey ||
            (e.button && e.button === 1)
          );
          var url = '/rooms/' + room.id;
          if (openInNewTab) {
            var win = window.open(url, '_blank');
            return win.focus();
          }
          window.location.href = url;
        },
      }); 
    },

  };

};