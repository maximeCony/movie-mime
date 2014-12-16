'use strict';

module.exports = Backbone.View.extend({

  template: _.template($('#room-row-template').html()),

  className: 'room',

  events: {
    'click': 'joinRoom',
  },

  render: function() {
    this.$el.html(this.template({
      room: this.model.toJSON(),
    }));
    return this;
  },

  joinRoom: function() {
    var params = {
      roomId: this.model.id,
      user: localStorage.getItem('movie-share-username') || 'unknown',
    };
    APP.socket.emit('room:join', params);
  },

});