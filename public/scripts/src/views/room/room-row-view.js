'use strict';

var DustView = require('../components/dust-view');

module.exports = DustView.extend({

  templateName: 'room-row',

  className: 'room-row',

  events: {
    'click': 'joinRoom',
  },

  getDustContext: function() {
    return {
      room: this.model.toJSON(),
    };
  },

  joinRoom: function() {
    window.location.href = '/rooms/' + this.model.id;
  },

});