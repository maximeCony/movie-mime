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

};