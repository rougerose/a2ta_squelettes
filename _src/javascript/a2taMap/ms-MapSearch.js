(function (global) {
  var MapSearch = (function () {
    "use strict";
    var config = {
      container: null,
      searchTrigger: null,
      searchPanel: null,
      searchTriggerID: "searchTrigger",
    };

    function setup(containerEl) {
      config.container = containerEl;
      config.searchTrigger = config.container.querySelector(
        "#" + config.searchTriggerID
      );

      var controlID = config.searchTrigger.getAttribute("aria-controls");
      config.searchPanel = config.container.querySelector("#" + controlID);

      config.searchTrigger.addEventListener("click", toggleSearch, false);
      setTriggerState(config.searchTrigger, false);
      setHiddenState(config.searchPanel, true);
    }

    function getTriggerState(triggerEl) {
      var state = triggerEl.getAttribute("aria-expanded");
      return state == "true";
    }

    function setTriggerState(triggerEl, boolean) {
      triggerEl.setAttribute("aria-expanded", boolean);
    }

    function setBusyState(el, boolean) {
      el.setAttribute("aria-busy", boolean);
    }

    function setHiddenState(el, boolean) {
      el.setAttribute("aria-hidden", boolean);
    }

    function toggleSearch(event) {
      var isExpanded = getTriggerState(this);

      if (!isExpanded) {
        setTriggerState(this, !isExpanded);
        showSearchPanel();
      } else {
        setTriggerState(this, !isExpanded);
        hideSearchPanel();
      }
    }

    function hideSearchPanel() {
      config.searchPanel.style.height =
        config.searchPanel.getBoundingClientRect().height + "px";
      setBusyState(config.searchPanel, true);
      var reflow = config.searchPanel.offsetHeight;
      config.searchPanel.addEventListener(
        "transitionend",
        onCompleteHide,
        false
      );
      config.searchPanel.style.height = "";
    }

    function showSearchPanel() {
      setBusyState(config.searchPanel, true);
      setHiddenState(config.searchPanel, false);
      var reflow = config.searchPanel.offsetHeight;
      var scrollHeight = config.searchPanel.scrollHeight;
      config.searchPanel.addEventListener(
        "transitionend",
        onCompleteShow,
        false
      );
      config.searchPanel.style.height = scrollHeight + "px";
    }

    function onCompleteShow(event) {
      config.searchPanel.style.height = "";
      setBusyState(config.searchPanel, false);
      config.searchPanel.removeEventListener(
        "transitionend",
        onCompleteShow,
        false
      );
    }

    function onCompleteHide(event) {
      setBusyState(config.searchPanel, false);
      setHiddenState(config.searchPanel, true);
      config.searchPanel.removeEventListener(
        "transitionend",
        onCompleteHide,
        false
      );
    }

    return {
      init: function (containerEl) {
        setup(containerEl);
      },
    };
  })();

  // Other things might happen here

  // expose our module to the global object
  global.MapSearch = MapSearch;
})(this);

window.addEventListener(
  "load",
  function (event) {
    var mapSearchEl = document.querySelector("#mapSearch");

    if (mapSearchEl) {
      // MapSearch.init(mapSearchEl);
    }
  },
  false
);
