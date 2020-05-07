A2ta.Map.Search.Panels = A2ta.Map.Search.Panels || {};

A2ta.Map.Search.Panels = (function () {
  var searchPanels = null;

  function init() {
    var mapContainer = A2ta.Map.getMapContainer();
    if (mapContainer) {
      var searchContainer = mapContainer.querySelector(
        "#" + A2ta.config.search.searchID
      );
      var triggerSearchPanels = searchContainer.querySelector(
        "#" + A2ta.config.search.triggerID
      );
      searchPanels = searchContainer.querySelectorAll(
        "#" +
          A2ta.config.search.fulltextPanelID +
          ", " +
          "#" +
          A2ta.config.search.advancedPanelID
      );
      triggerSearchPanels.addEventListener("click", handleEventTrigger, false);
      setTriggerState(triggerSearchPanels, false);
      toggleSearchPanels(0);
    }
  }

  function toggleSearchPanels(isVisible) {
    var panelIsVisible = isVisible || 0;
    searchPanels.forEach(function (panel, index) {
      if (index == panelIsVisible) {
        showSearchPanel(panel);
        // Version sans animation
        // setHiddenState(panel, false);
      } else {
        hideSearchPanel(panel);
        // Version sans animation
        // setHiddenState(panel, true);
      }
    });
  }

  function showSearchPanel(panel) {
    setBusyState(panel, true);
    setHiddenState(panel, false);
    var reflow = panel.offsetHeight;
    var scrollHeight = panel.scrollHeight;
    panel.addEventListener("transitionend", onCompleteShowAnimation, false);
    panel.style.height = scrollHeight + "px";
  }

  function hideSearchPanel(panel) {
    panel.style.height = panel.getBoundingClientRect().height + "px";
    setBusyState(panel, true);
    var reflow = panel.offsetHeight;
    panel.addEventListener("transitionend", onCompleteHideAnimation, false);
    panel.style.height = "";
  }

  function handleEventTrigger(event) {
    var state = getTriggerState(this);
    setTriggerState(this, !state);
    // Convertir le booléen en nombre,
    // qui détermine le panneau à afficher.
    var panelIndex = !state ? 1 : 0;
    toggleSearchPanels(panelIndex);
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

  function toggleAdvancedSearchPanel(event) {
    var trigger = this;
    var isExpanded = getState(trigger);

    if (!isExpanded) {
      setState(trigger, !isExpanded);
      showAdvancedSearchPanel();
    } else {
      setState(trigger, !isExpanded);
      hideAdvancedSearchPanel();
    }
  }

  function onCompleteShowAnimation(event) {
    this.style.height = "";
    setBusyState(this, false);
    this.removeEventListener("transitionend", onCompleteShowAnimation, false);
  }

  function onCompleteHideAnimation(event) {
    setBusyState(this, false);
    setHiddenState(this, true);
    this.removeEventListener("transitionend", onCompleteHideAnimation, false);
  }

  return {
    init: init,
  };
})();
