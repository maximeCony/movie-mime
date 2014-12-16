'use strict';

module.exports = Backbone.View.extend({

  el: '#app',

  template: _.template($('#room-template').html()),

  render: function() {
    this.$el.html(this.template({
      room: this.model.toJSON(),
    }));
    return this;
  },

});