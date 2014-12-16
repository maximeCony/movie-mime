'use strict';

var RoomRowView = require('./room-row-view');

module.exports = Backbone.View.extend({

  el: '#app',

  template: _.template($('#rooms-template').html()),

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
    this.collection.forEach(this.addOne, this);
    return this;
  },

});