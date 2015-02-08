'use strict';

var RoomRowView = require('./room-row-view');

module.exports = Backbone.View.extend({

  el: '#app',

  template: _.template($('#rooms-template').html()),

  events: {
    'click .js-createRoomModal': 'createRoomModal',
    'submit #js-createRoomForm': 'createRoom',
  },

  initialize: function() {
    this.listenTo(this.collection, 'reset', this.render);
    this.listenTo(this.collection, 'add', this.addOne);
  },

  addOne: function(model) {
    var view = new RoomRowView({ model: model });
    this.$rows.append(view.render().$el.fadeIn());
  },

  render: function() {
    this.$el.html(this.template());
    this.$rows = this.$el.find('#js-rooms').html('');
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
    console.log(this.$createRoomForm);
  },

});