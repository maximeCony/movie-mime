'use strict';

var animateGrowClassTimeout;

module.exports = {

  heartBeat: function() {
    var $heart = $('.heart');
    $heart.addClass('animate-grow');
    if (animateGrowClassTimeout) {
      clearTimeout(animateGrowClassTimeout);
    }
    animateGrowClassTimeout = setTimeout(function() {
      $heart.removeClass('animate-grow');
    }, 200);
  },

  serializeForm: function($from) {
    return _.object(
      _.map($from.serializeArray(), function(object) {
        return [
          object.name, 
          object.value === '' ? null : object.value,
        ];
      })
    );
  },

};