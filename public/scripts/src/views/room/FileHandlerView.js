'use strict';

var DustView = require('../components/DustView');

module.exports = DustView.extend({

  el: '#app',

  templateName: 'room/fileHandler.dust',

  initialize: function () {
    $(document)
      .on('dragenter', this.dragenter.bind(this))
      .on('dragover', this.dragover.bind(this))
      .on('dragleave', this.dragleave.bind(this))
      .on('drop', this.drop.bind(this));
  },

  dragenter: function(e) {
    e.stopPropagation();
    e.preventDefault();
  },

  dragover: function(e) {
    e.stopPropagation();
    e.preventDefault();
    this.$handler.addClass('fileHandler-dragOver');
  },

  dragleave: function(e) {
    e.stopPropagation();
    e.preventDefault();
    this.$handler.removeClass('fileHandler-dragOver');
  },

  drop: function(e) {
    e.stopPropagation();
    e.preventDefault();
    var file = e.originalEvent.dataTransfer.files[0];
    APP.views.localVideoView.setFile(file);
    APP.views.localVideoView.render();
  },

  rendered: function () {
    this.$handler = this.$el.find('.js-dragDropFileHandler');
  },

});
