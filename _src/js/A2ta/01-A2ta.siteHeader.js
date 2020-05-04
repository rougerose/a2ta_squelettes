A2ta.siteHeader = A2ta.siteHeader || {};

A2ta.siteHeader = (function () {
  var header = null,
    deltaHeader = 5,
    lastScrollTop = 0,
    headerHeight = 0;

  function init() {
    header = document.body.querySelector(
      "header" + A2ta.config.sitePage.sections
    );
    headerHeight = header.offsetHeight;
    handleOnScroll();
    var menuTrigger = header.querySelector(
      "#" + A2ta.config.header.menuTriggerID
    );
    menuTrigger.addEventListener("click", handleClickMenu, false);
  }

  // https://medium.com/@mariusc23/hide-header-on-scroll-down-show-on-scroll-up-67bbaae9a78c
  function toggleHeader() {
    var st = window.scrollY;
    if (Math.abs(lastScrollTop - st) <= deltaHeader) {
      return;
    }
    if (st > lastScrollTop && st > headerHeight) {
      header.classList.remove("is-visible");
      header.classList.add("is-hidden");
    } else {
      if (st + window.innerHeight < document.documentElement.offsetHeight) {
        header.classList.remove("is-hidden");
        header.classList.add("is-visible");
      }
    }
    lastScrollTop = st;
  }

  // https://remysharp.com/2017/06/28/sticky-headers
  function handleOnScroll() {
    var rafTimer;
    window.onscroll = function (event) {
      cancelAnimationFrame(rafTimer);
      rafTimer = requestAnimationFrame(toggleHeader);
    };
  }

  function handleClickMenu(event) {
    if (this.classList.contains("is-active")) {
      this.classList.remove("is-active");
    } else {
      this.classList.add("is-active");
    }
  }

  return {
    init: init,
  };
})();
