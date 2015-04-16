'use strict';

module.exports = Backbone.View.extend({

  templateName: undefined,

  getDustContext: function() {
    return {};
  },

  render: function() {
    var me = this;
    dust.render(this.templateName, this.getDustContext(), function(err, out) {
      if (err) return console.error(err);
      me.$el.html(out);
      if (me.rendered) me.rendered();
    });
    return this;
  },

});