A2ta.Map.Search.Tabs = A2ta.Map.Search.Tabs || {};

A2ta.Map.Search.Tabs = (function () {
  function init() {
    var mapContainer = A2ta.Map.getMapContainer();
    var searchAdvancedPanel = mapContainer.querySelector(
      "#" + A2ta.config.search.advancedPanelID
    );
    var tabsHead = searchAdvancedPanel.children[0];
    var tabsBody = searchAdvancedPanel.children[1];
    var tabs = _toConsumableArray(tabsHead.children);
    var panels = _toConsumableArray(tabsBody.children);

    tabs.forEach(function (tab, index) {
      var panel = panels[index];
      resetTabs(tab);
      resetPanels(panel);
      tab.addEventListener(
        "click",
        function (event) {
          activate(event.currentTarget, panel);
        },
        false
      );
      if (0 == index) {
        activateTab(tab);
        activatePanel(panel);
      }
    });
  }

  function activate(tab, panel) {
    resetTabs(_toConsumableArray(tab.parentNode.children));
    resetPanels(_toConsumableArray(panel.parentNode.children));
    activateTab(tab);
    activatePanel(panel);
  }

  function activateTab(tab) {
    tab.setAttribute("aria-selected", "true");
  }

  function activatePanel(panel) {
    panel.setAttribute("aria-hidden", "false");
  }

  function resetPanels(panel) {
    if (Array.isArray(panel)) {
      panel.forEach(function (p) {
        return p.setAttribute("aria-hidden", "true");
      });
    } else {
      return panel.setAttribute("aria-hidden", "true");
    }
  }

  function resetTabs(tab) {
    if (Array.isArray(tab)) {
      tab.forEach(function (t) {
        return t.setAttribute("aria-selected", "false");
      });
    } else {
      return tab.setAttribute("aria-selected", "false");
    }
  }

  return {
    init: init,
  };
})();
