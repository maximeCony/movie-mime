'use strict';

var _URL = window.URL || window.webkitURL,
  $video = $('#js-video'),
  $handler = $('#js-dragDropFileHandler');

var handleFile = function(file) {
  $video[0].src = _URL.createObjectURL(file);
};

$handler
  .on('dragenter', function(e) {
    e.stopPropagation();
    e.preventDefault();
    $(this).css('border', '2px solid #0B85A1');
  })
  .on('dragover', function(e) {
    e.stopPropagation();
    e.preventDefault();
  })
  .on('drop', function(e) {
    $(this).css('border', '2px dotted #0B85A1');
    e.preventDefault();
    var files = e.originalEvent.dataTransfer.files;
    handleFile(files[0]);
  });

$(document)
  .on('dragenter', function(e) {
    e.stopPropagation();
    e.preventDefault();
  })
  .on('dragover', function(e) {
    e.stopPropagation();
    e.preventDefault();
    $handler.css('border', '2px dotted #0B85A1');
  })
  .on('drop', function(e) {
    e.stopPropagation();
    e.preventDefault();
  });