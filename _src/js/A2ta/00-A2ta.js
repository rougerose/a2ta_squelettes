"use strict";
var A2ta = A2ta || {};

A2ta = (function () {
  var config = {
    loadingPage: {
      containerID: "loadingPage",
    },
    map: {
      container: ".c-carte",
    },
    search: {
      containerID: "mapSearch",
      triggerID: "searchTrigger",
    },
  };

  var loadingPage = null;

  function init() {
    loadingPage = document.getElementById(config.loadingPage.containerID);
    document.body.classList.add("is-js-ready");
    setupLoadingPage();
  }

  function setupLoadingPage() {
    if (loadingPage && loadingPage.classList.contains("is-visible")) {
      document.body.classList.add("is-locked");
      loadingPage.classList.add("is-js-ready");
      loadingPage.addEventListener("swiped-up", hideLoadingPage, false);
      loadingPage.addEventListener("click", hideLoadingPage, false);
    }
  }

  function hideLoadingPage(event) {
    loadingPage.classList.remove("is-js-ready", "is-visible");
    loadingPage.classList.add("is-hidden");
    document.body.classList.remove("is-locked");
    loadingPage.removeEventListener("swiped-up", hideLoadingPage, false);
    loadingPage.removeEventListener("click", hideLoadingPage, false);
  }

  return {
    config: config,
    init: init,
  };
})();
