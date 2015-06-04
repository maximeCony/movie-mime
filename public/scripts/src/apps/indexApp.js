'use strict';

window.$ = window.jQuery = require('jquery');

$(function() {

  var IndexView = require('../views/IndexView');
  
  var indexView = new IndexView();
  indexView.initialize();
});