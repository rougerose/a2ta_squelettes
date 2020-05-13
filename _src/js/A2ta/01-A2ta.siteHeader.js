A2ta.siteHeader = A2ta.siteHeader || {};

A2ta.siteHeader = (function () {
  var header = null,
    deltaHeader = 5,
    lastScrollTop = 0,
    headerHeight = 0,
    menuTriggers = null;

  function init() {
    header = document.body.querySelector(
      "header" + A2ta.config.sitePage.sections
    );
    headerHeight = header.offsetHeight;
    handleOnScroll();

    menuTriggers = document.querySelectorAll(
      "." + A2ta.config.header.menuTrigger
    );
    menuTriggers.forEach(function (trigger) {
      trigger.addEventListener("click", handleTriggerEvent, false);
    });

    // Nav -> Transition delay
    var nav = document.querySelector("." + A2ta.config.header.nav);
    var list = nav.children[0].children,
      delay = 2;

    for (var i = 0; i < list.length; i++) {
      list[i].style.transitionDelay = (delay + i) / 10 + "s";
    }
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

  function handleTriggerEvent(event) {
    var body = document.body,
      open;

    if (body.classList.contains("nav-is-opened")) {
      body.classList.remove("nav-is-opened");
      open = false;
    } else {
      body.classList.add("nav-is-opened");
      open = true;
    }
    menuTriggers.forEach(function (trigger) {
      if (open) {
        trigger.classList.add("is-active");
      } else {
        trigger.classList.remove("is-active");
      }
    });
  }

  return {
    init: init,
  };
})();
