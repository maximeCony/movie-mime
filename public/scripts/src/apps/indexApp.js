'use strict';

window.$ = window.jQuery = require('jquery');

$(function() {

  var shortid = require('shortid');
  
  $('.js-createRoom').click(function (e) {
    var openInNewTab = (e.ctrlKey || 
      e.shiftKey || 
      e.metaKey ||
      (e.button && e.button === 1)
    );
    var url = '/rooms/' + shortid.generate();
    if (openInNewTab) {
      var win = window.open(url, '_blank');
      return win.focus();
    }
    window.location.href = url;
  });

});