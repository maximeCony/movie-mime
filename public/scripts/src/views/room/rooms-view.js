'use strict';

var RoomRowView = require('./room-row-view');
var utils = require('../../lib/utils');

module.exports = Backbone.View.extend({

  el: 'body',

  events: {
    'click .js-createRoomModal': 'createRoomModal',
    'submit .js-createRoomForm': 'createRoom',
  },

  initialize: function() {
    this.listenTo(this.collection, 'reset', this.render);
    this.listenTo(this.collection, 'add', this.addOne);
    this.$rows = this.$el.find('.js-rooms');
    this.$createRoomModal = $('#js-createRoomModal');
  },

  addOne: function(model) {
    var view = new RoomRowView({ model: model });
    this.$rows.append(view.render().$el.fadeIn());
  },

  render: function() {
    this.$rows.html('');
    this.collection.forEach(this.addOne, this);
    return this;
  },

  createRoomModal: function() {
    this.$createRoomModal.modal('show');
  },

  createRoom: function(e) {
    e.preventDefault();
    var attributes = utils.serializeForm($(e.currentTarget)),
      me = this;
    this.collection.create(attributes, {
      wait: true,
      error: function () {
        // TODO: alert
      },
      success: function () {
        me.$createRoomModal.modal('hide');
      },
    });
  },

});