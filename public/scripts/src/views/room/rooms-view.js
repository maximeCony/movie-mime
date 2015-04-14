'use strict';

var RoomRowView = require('./room-row-view'),
  utils = require('../../lib/utils');

module.exports = Backbone.View.extend({

  el: 'body',

  template: _.template($('#rooms-template').html()),

  events: {
    'click .js-createRoomModal': 'createRoomModal',
    'submit .js-createRoomForm': 'createRoom',
  },

  initialize: function() {
    this.listenTo(this.collection, 'reset', this.render);
    this.listenTo(this.collection, 'add', this.addOne);
    this.$app = this.$el.find('#app');
  },

  addOne: function(model) {
    var view = new RoomRowView({ model: model });
    this.$rows.append(view.render().$el.fadeIn());
  },

  render: function() {
    this.$app.html(this.template());
    this.$rows = this.$app.find('#js-rooms').html('');
    this.$createRoomModal = $('#js-createRoomModal');
    this.$createRoomForm = this.$createRoomModal.find('#createRoomForm');
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
        // TODO
      },
      success: function () {
        me.$createRoomModal.modal('hide');
      },
    });
  },

});