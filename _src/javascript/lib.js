'use strict';
/**
 * @param {!Element} el
 * @param {!Function} callback
 * @return {undefined}
 */
function swipedetect(el, callback) {
  var direction;
  var resizeClickPositionX;
  var initialCropBoxPositionY;
  var posX;
  var i;
  var s;
  var c;
  /** @type {!Element} */
  var d = el;
  /** @type {number} */
  var end = 150;
  /** @type {number} */
  var start = 100;
  /** @type {number} */
  var sum = 300;
  var handleswipe = callback || function(index_or_direction) {
  };
  d.addEventListener("touchstart", function(event) {
    var b = event.changedTouches[0];
    /** @type {string} */
    direction = "none";
    /** @type {number} */
    dist = 0;
    resizeClickPositionX = b.pageX;
    initialCropBoxPositionY = b.pageY;
    /** @type {number} */
    c = (new Date).getTime();
    event.preventDefault();
  }, false);
  d.addEventListener("touchmove", function(event) {
    event.preventDefault();
  }, false);
  d.addEventListener("touchend", function(event) {
    var e = event.changedTouches[0];
    /** @type {number} */
    posX = e.pageX - resizeClickPositionX;
    /** @type {number} */
    i = e.pageY - initialCropBoxPositionY;
    /** @type {number} */
    s = (new Date).getTime() - c;
    if (sum >= s) {
      if (Math.abs(posX) >= end && Math.abs(i) <= start) {
        /** @type {string} */
        direction = 0 > posX ? "left" : "right";
      } else {
        if (Math.abs(i) >= end && Math.abs(posX) <= start) {
          /** @type {string} */
          direction = 0 > i ? "up" : "down";
        }
      }
    }
    handleswipe(direction);
    event.preventDefault();
  }, false);
}
;
