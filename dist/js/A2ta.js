"use strict";
var A2ta = A2ta || {};

A2ta = (function () {
  var config = {
    loadingPage: {
      containerID: "loadingPage",
    },
    sitePage: {
      sections: "[data-section]",
    },
    header: {
      menuTriggerID: "hamburger",
    },
    map: {
      containerID: "a2taMap",
      defaultLat: "",
      defaultLng: "",
      defaultZoom: "",
    },
    search: {
      searchID: "mapSearch",
      triggerID: "openAdvancedSearch",
      fulltextPanelID: "fulltextSearch",
      advancedPanelID: "advancedSearch",
      labelClass: "mp-Form_Label",
      messageID: "searchFormMessage",
      messageClass: "mp-Form_Message mp-Form_Message-Info",
      messageLabelClass: "mp-Form_MessageLabel",
      messageDeleteClass: "btn mp-Form_DeleteMessage",
      scrollContainerClass: "mp-Scroll",
      scrollbarClass: "mp-Scroll_Scrollbar",
      scrollbarFillClass: "mp-Scroll_ScrollbarFill",
      categoryClass: "mp-Category",
    },
    keywords: {
      containerID: "mapSearchKeywords",
      listClass: "mp-Keywords_List",
      listItemClass: "mp-Keywords_ListItem",
      labelClass: "mp-Keywords_Label",
      buttonClass: "btn mp-Keywords_DeleteKeyword",
      buttonID: "deleteKeyword",
    },
  };

  var loadingPage = null,
    mainSection = null,
    mapContainer = null;

  function init() {
    loadingPage = document.getElementById(config.loadingPage.containerID);

    // Préparer le pied de page
    var footer = document.querySelector("footer" + config.sitePage.sections);
    document.body.style.paddingBottom = footer.offsetHeight + "px";

    // Préparer l'animation de l'élément <main>
    mainSection = document.querySelector("main" + config.sitePage.sections);
    var translateValue = window.innerHeight / 4;
    mainSection.children[0].style.transform =
      "translate3d(0, " + translateValue + "px, 0)";

    // Déterminer si le fragment LoadingPage doit être affiché,
    // ou bien la page de contenu.
    showLoadingPage();

    // Initialiser siteHeader
    A2ta.siteHeader.init();
  }

  function showContentPage() {
    // Récupérer les sections principales (header, main et footer)
    var pageSections = document.querySelectorAll(config.sitePage.sections);

    setTimeout(function () {
      mainSection.children[0].classList.add("is-visible");
      pageSections.forEach(function (section) {
        section.classList.add("is-visible");
      });
      mainSection.children[0].style.transform = "";
    }, 900);
  }

  function showLoadingPage() {
    if (loadingPage && loadingPage.classList.contains("is-visible")) {
      document.body.classList.add("is-locked");
      loadingPage.classList.add("is-js-ready");
      loadingPage.addEventListener("swiped-up", handleEventLoadingPage, false);
      loadingPage.addEventListener("click", handleEventLoadingPage, false);
    } else {
      // Pas de page intermédiaire, afficher le contenu
      showContentPage();
    }
  }

  function handleEventLoadingPage(event) {
    loadingPage.classList.remove("is-js-ready", "is-visible");
    loadingPage.classList.add("is-hidden");
    document.body.classList.remove("is-locked");
    loadingPage.removeEventListener("swiped-up", handleEventLoadingPage, false);
    loadingPage.removeEventListener("click", handleEventLoadingPage, false);
    // Après la page intermédiaire, afficher le contenu
    showContentPage();
  }

  return {
    config: config,
    init: init,
  };
})();

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

A2ta.Map = A2ta.Map || {};

A2ta.Map = (function () {
  var map = null;
  var container = null;

  function init(mapObj) {
    map = mapObj;
    setZoomControl(map);
    A2ta.config.map.defaultLat = map.options.center[0];
    A2ta.config.map.defaultLng = map.options.center[1];
    A2ta.config.map.defaultZoom = map.options.zoom;
    container = document.getElementById(A2ta.config.map.containerID);

    A2ta.Map.Search.init();
  }

  function setZoomControl(mapObj) {
    // Position par défaut du zoom est désactivée. Puis définie à nouveau.
    mapObj.options.zoomControl = false;
    L.control.zoom({ position: "bottomleft" }).addTo(mapObj);
  }

  function chargerGeoPoints(keywords) {
    if (Array.isArray(keywords)) {
      if (keywords.length) {
        // Il y a au moins une association à afficher.
        var queryObject = {
          id_association: [],
          id_mot: [],
          ville: [],
          limit: 500,
        };

        map.removeAllMarkers();

        // Construire la requête à partir des mots-clés
        // demandés par l'utilisateur.

        for (var i = 0; i < keywords.length; i++) {
          var p = keywords[i].split(":");

          var property;
          for (property in queryObject) {
            var k = p[0];
            var l = queryObject[k].length;

            if (property === k) {
              queryObject[k][l] = p[1];
            }
          }
        }
        // Convertir l'objet en url (avec jquery)
        var query = $.param(queryObject);
        var url = "http.api/collectionjson/associations?";

        // à partir des mots-clés de la requête,
        // obtenir les id_association correspondants.
        $.getJSON(url + query)
          .done(function (json) {
            var associations = { id_association: [] };

            $.each(json.collection.items, function (key, item) {
              associations.id_association[key] = item.data[0].value;
            });

            // Récupérer les infos de géolocalisation des associations
            // depuis le squelette json/gis_associations_env
            var q = $.param(associations);
            var url = "?page=gis_json&objets=associations_env&limit=500&" + q;

            $.getJSON(url).done(function (json) {
              parseJson(json, false);
            });
          })
          .fail(function (jqxhr, textStatus, error) {
            var message = A2ta.Map.Search.getNoResultMessage();
            var keywordsContainer = document.querySelector(
              "#" + A2ta.config.keywords.containerID
            );
            keywordsContainer.appendChild(message);
          });
      } else {
        // Aucune association.
        // Afficher la carte dans sa position initiale
        // et avec toutes les associations disponibles.
        var url = "?page=gis_json&objets=associations&limit=500";
        $.getJSON(url).done(function (json) {
          parseJson(json, true);
        });
      }
    }
  }

  /**
   * Afficher les points de géolocalisation
   *
   * Fonction dérivée et simplifiée de celle disponible
   * dans l'API de GIS, mais qui n'utilise pas les options
   * de zoom et de centre (centerAndZoom) assez obscures.
   */
  function parseJson(json, reset) {
    var defaultView = reset;

    var markers = [];
    map.markerCluster = L.markerClusterGroup(map.options.clusterOptions).addTo(
      map
    );

    $.each(json.features, function (i, feature) {
      if (
        feature.geometry.type === "Point" &&
        feature.geometry.coordinates[0]
      ) {
        var marker = L.marker([
          feature.geometry.coordinates[1],
          feature.geometry.coordinates[0],
        ]);
        map.setGeoJsonFeatureIcon(feature, marker);
        map.setGeoJsonFeaturePopup(feature, marker);
        marker.feature = feature;
        markers.push(marker);
      }
    });

    map.markerCluster.addLayers(markers);

    if (!reset) {
      var bounds = map.markerCluster.getBounds();
      var options = { maxZoom: 16 };
      map.fitBounds(bounds, options);
    } else {
      map.setView(
        [A2ta.config.map.defaultLat, A2ta.config.map.defaultLng],
        A2ta.config.map.defaultZoom
      );
    }
  }

  return {
    init: init,
    chargerGeoPoints: chargerGeoPoints,
    getMapContainer: function () {
      return container;
    },
  };
})();

A2ta.Map.Search = A2ta.Map.Search || {};

A2ta.Map.Search = (function () {
  var labels = null,
    mapContainer = null,
    keywordLabels = [],
    keywordValues = [];

  function init() {
    var mapContainer = A2ta.Map.getMapContainer();
    if (mapContainer) {
      var searchContainer = mapContainer.querySelector(
        "#" + A2ta.config.search.searchID
      );
      setupSearchInputs(searchContainer);
      setupSearchActivities(searchContainer);
      A2ta.Map.Search.Panels.init();
      A2ta.Map.Search.Scroll.init();
      A2ta.Map.Search.Tabs.init();
    }
  }

  function setupSearchInputs(searchContainer) {
    labels = searchContainer.querySelectorAll(
      "." + A2ta.config.search.labelClass
    );

    var inputs = searchContainer.querySelectorAll("input[type=text]");

    labels.forEach(function (label) {
      label.classList.add("js-FormLabel");
    });

    inputs.forEach(function (input, index) {
      // Focus event
      input.addEventListener(
        "focus",
        function (event) {
          handleEventInput(event, index);
        },
        false
      );
      // Blur event
      input.addEventListener(
        "blur",
        function (event) {
          handleEventInput(event, index);
        },
        false
      );
    });
  }

  function setupSearchActivities(searchContainer) {
    var advancedSearch = searchContainer.querySelector(
      "#" + A2ta.config.search.advancedPanelID
    );
    var activities = advancedSearch.querySelectorAll(
      "." + A2ta.config.search.categoryClass
    );
    activities.forEach(function (activity) {
      activity.addEventListener("click", handleClickActivity, false);
    });
  }

  function handleClickActivity(event) {
    var keyword = {
      label: this.dataset.label,
      value: this.dataset.value,
    };

    handleKeyword(keyword);
  }

  function handleKeyword(keyword) {
    var label = keyword.label,
      value = keyword.value;

    var alreadyExists = keywordValues.indexOf(value);

    if (alreadyExists == -1) {
      keywordLabels.push(label);
      keywordValues.push(value);
      // Index du mot dans le tableau
      var index = keywordLabels.length - 1;
      // Afficher le mot-clé
      var keywordHTML = setKeyword(label, value);
      addKeyword(keywordHTML, index);
    }
  }

  function handleEventInput(event, index) {
    if ("focus" == event.type) {
      labels[index].classList.add("is-Focused");
    }

    if ("blur" == event.type && "" == event.target.value) {
      labels[index].classList.remove("is-Focused");
    }
  }

  function autocompleteFullText(event, ui) {
    var keyword = {
      label: ui.item.label,
      value: ui.item.value,
    };

    handleKeyword(keyword);

    this.value = "";
    return false;
  }

  function setupNoResultMessage() {
    // Récupérer tous les éléments avec une instance ui-autocomplete
    var autocompleteEls = $(":data('ui-autocomplete')");
    // Pour chacun de ces éléments, afficher un message
    // pour une recherche sans résultat.
    $.each(autocompleteEls, function (index, element) {
      $(element).on("autocompleteresponse", function (event, ui) {
        var parent = this.parentNode;
        var messageClass = A2ta.config.search.messageClass.split(" ");
        var childMessage = parent.querySelector("." + messageClass[0]);

        if (!ui.content.length && !childMessage) {
          var inputVal = this.value;
          if (inputVal) {
            var message = getNoResultMessage(inputVal);
            parent.appendChild(message);
          }
        } else if (ui.content.length && childMessage) {
          parent.removeChild(childMessage);
        }
      });
    });
  }

  function getNoResultMessage(inputValue) {
    var messageText = "";
    if (inputValue) {
      messageText = `Aucun résultat pour « ${inputValue} »`;
    } else {
      messageText = `Aucun résultat`;
    }
    var message = document.createElement("div");
    message.className = A2ta.config.search.messageClass;

    var span = document.createElement("span");
    span.className = A2ta.config.search.messageLabelClass;
    span.appendChild(document.createTextNode(messageText));
    message.appendChild(span);

    if (inputValue) {
      var button = document.createElement("button");
      button.className = A2ta.config.search.messageDeleteClass;
      button.addEventListener("click", handleEventNoResultMessage, false);
      message.appendChild(button);
    }

    return message;
  }

  function handleEventNoResultMessage(event) {
    var messageContainer = this.offsetParent;
    var parent = messageContainer.offsetParent;
    parent.removeChild(messageContainer);
  }

  function setKeyword(label, value) {
    var listItem = document.createElement("li");
    listItem.className = A2ta.config.keywords.listItemClass;

    var span = document.createElement("span");
    span.className = A2ta.config.keywords.labelClass;
    span.appendChild(document.createTextNode(label));

    var button = document.createElement("button");
    button.className = A2ta.config.keywords.buttonClass;
    button.id = A2ta.config.keywords.buttonID;
    button.dataset.value = value;
    button.addEventListener("click", removeKeyword, false);

    listItem.appendChild(span);
    listItem.appendChild(button);

    return listItem;
  }

  function addKeyword(keyword, index) {
    var keywordsContainer = document.querySelector(
      "#" + A2ta.config.keywords.containerID
    );
    // Vérifier si une liste existe déjà
    var list = keywordsContainer.firstChild;
    if (!list) {
      // Si ce n'est pas le cas, créer la liste.
      list = document.createElement("ul");
      list.className = A2ta.config.keywords.listClass;
    }
    list.appendChild(keyword);
    //Afficher la liste
    keywordsContainer.appendChild(list);

    // Vérifier si la liste ne contient pas le message "Aucun résultat"
    var messageClass = A2ta.config.search.messageClass.split(" ");
    var messageNoResult = keywordsContainer.querySelector(
      "." + messageClass[0]
    );
    if (messageNoResult) {
      keywordsContainer.removeChild(messageNoResult);
    }
    // Recharger la carte en fonction des critères.
    A2ta.Map.chargerGeoPoints(keywordValues);
  }

  function removeKeyword(event) {
    var value = this.dataset.value;
    var parent = this.offsetParent;
    var index = keywordValues.indexOf(value);
    if (value !== -1) {
      // Supprimer les mots-clés des tableaux qui servent de référence
      // et de la liste affichée à l'utilisateur.
      keywordLabels.splice(index, 1);
      keywordValues.splice(index, 1);
      parent.removeChild(parent.childNodes[index]);

      // Vérifier si la liste ne contient pas le message "Aucun résultat"
      var messageClass = A2ta.config.search.messageClass.split(" ");
      var messageNoResult = parent.parentNode.querySelector(
        "." + messageClass[0]
      );
      if (messageNoResult) {
        parent.parentNode.removeChild(messageNoResult);
      }

      // Recharger la carte
      A2ta.Map.chargerGeoPoints(keywordValues);
    }
  }

  return {
    init: init,
    autocompleteFullText: autocompleteFullText,
    getNoResultMessage: getNoResultMessage,
  };
})();

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

// https://medium.com/@sbastienperrot/comment-mettre-en-place-une-scrollbar-universelle-en-pur-javascript-8af0f522cad6
A2ta.Map.Search.Scroll = A2ta.Map.Search.Scroll || {};

A2ta.Map.Search.Scroll = (function () {
  var scrollableContainer = null,
    scrollableContent = null,
    scrollbar = null,
    scrollbarFill = null,
    boxSize = null,
    scrollSize = null,
    toScrollSize = null,
    scrollPosition = null,
    offsetStart = null;

  function init() {
    var mapContainer = A2ta.Map.getMapContainer();
    if (mapContainer) {
      scrollableContainer = mapContainer.querySelector(
        "." + A2ta.config.search.scrollContainerClass
      );
      scrollableContent = scrollableContainer.firstElementChild;
      scrollbar = scrollableContainer.querySelector(
        "." + A2ta.config.search.scrollbarClass
      );
      scrollbarFill = scrollableContainer.querySelector(
        "." + A2ta.config.search.scrollbarFillClass
      );

      setScrollSize();

      // Déplacement de la scrollbar avec le scroll
      var rafTimer;
      scrollableContainer.addEventListener("scroll", function (event) {
        cancelAnimationFrame(rafTimer);
        scrollPosition = boxSize * (event.target.scrollLeft / scrollSize);
        rafTimer = requestAnimationFrame(setScroll);
      });

      scrollbar.addEventListener("mousedown", onScrollbarClick, false);

      // Drag & Drop sur la scrollbar
      scrollbarFill.addEventListener(
        "mousedown",
        onScrollbarFillMousedown,
        false
      );
    }
  }

  function setScrollSize() {
    var scrollbarSize;
    boxSize = scrollableContainer.clientWidth;
    scrollSize = scrollableContent.scrollWidth;
    toScrollSize = scrollSize - boxSize;

    // Définir la taille de la scrollbar et de son conteneur
    scrollbarFill.style.transform = "translate3d(0, 0, 0)";
    scrollbarFill.style.width = 100 * (boxSize / scrollSize) + "%";
    scrollbarSize = scrollbarFill.clientWidth;
    scrollbarFill.style.zIndex = boxSize >= scrollSize ? -1 : 2;
    scrollbar.style.zIndex = boxSize >= scrollSize ? -1 : 1;
  }

  function setScroll() {
    scrollbarFill.style.transform =
      "translate3d(" + scrollPosition + "px, 0, 0)";
  }

  function onScrollbarClick(event) {
    scrollableContainer.scrollLeft = scrollSize * (event.offsetX / boxSize);
  }

  function onScrollbarFillMousedown(event) {
    event.preventDefault();
    event.stopPropagation();
    offsetStart =
      event.offsetX + scrollableContainer.getBoundingClientRect().left;
    scrollableContainer.addEventListener(
      "mousemove",
      onScrollbarFillMousemove,
      false
    );
    scrollableContainer.addEventListener(
      "mouseup",
      onScrollbarFillMouseup,
      false
    );
  }

  function onScrollbarFillMousemove(event) {
    event.preventDefault();
    event.stopPropagation();
    scrollableContainer.scrollLeft =
      scrollSize * ((event.clientX - offsetStart) / boxSize);
  }

  function onScrollbarFillMouseup(event) {
    event.preventDefault();
    event.stopPropagation();
    scrollableContainer.removeEventListener(
      "mousemove",
      onScrollbarFillMousemove
    );
    scrollableContainer.removeEventListener(
      "mouseup",
      onScrollbarFillMousemove
    );
  }

  return {
    init: init,
    setScrollSize: setScrollSize,
  };
})();

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

// // Array.from pollyfil
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/from#Polyfill
//
// Production steps of ECMA-262, Edition 6, 22.1.2.1
if (!Array.from) {
  Array.from = (function () {
    var toStr = Object.prototype.toString;
    var isCallable = function (fn) {
      return typeof fn === "function" || toStr.call(fn) === "[object Function]";
    };
    var toInteger = function (value) {
      var number = Number(value);
      if (isNaN(number)) {
        return 0;
      }
      if (number === 0 || !isFinite(number)) {
        return number;
      }
      return (number > 0 ? 1 : -1) * Math.floor(Math.abs(number));
    };
    var maxSafeInteger = Math.pow(2, 53) - 1;
    var toLength = function (value) {
      var len = toInteger(value);
      return Math.min(Math.max(len, 0), maxSafeInteger);
    };

    // The length property of the from method is 1.
    return function from(arrayLike /*, mapFn, thisArg */) {
      // 1. Let C be the this value.
      var C = this;

      // 2. Let items be ToObject(arrayLike).
      var items = Object(arrayLike);

      // 3. ReturnIfAbrupt(items).
      if (arrayLike == null) {
        throw new TypeError(
          "Array.from requires an array-like object - not null or undefined"
        );
      }

      // 4. If mapfn is undefined, then let mapping be false.
      var mapFn = arguments.length > 1 ? arguments[1] : void undefined;
      var T;
      if (typeof mapFn !== "undefined") {
        // 5. else
        // 5. a If IsCallable(mapfn) is false, throw a TypeError exception.
        if (!isCallable(mapFn)) {
          throw new TypeError(
            "Array.from: when provided, the second argument must be a function"
          );
        }

        // 5. b. If thisArg was supplied, let T be thisArg; else let T be undefined.
        if (arguments.length > 2) {
          T = arguments[2];
        }
      }

      // 10. Let lenValue be Get(items, "length").
      // 11. Let len be ToLength(lenValue).
      var len = toLength(items.length);

      // 13. If IsConstructor(C) is true, then
      // 13. a. Let A be the result of calling the [[Construct]] internal method
      // of C with an argument list containing the single item len.
      // 14. a. Else, Let A be ArrayCreate(len).
      var A = isCallable(C) ? Object(new C(len)) : new Array(len);

      // 16. Let k be 0.
      var k = 0;
      // 17. Repeat, while k < len… (also steps a - h)
      var kValue;
      while (k < len) {
        kValue = items[k];
        if (mapFn) {
          A[k] =
            typeof T === "undefined"
              ? mapFn(kValue, k)
              : mapFn.call(T, kValue, k);
        } else {
          A[k] = kValue;
        }
        k += 1;
      }
      // 18. Let putStatus be Put(A, "length", len, true).
      A.length = len;
      // 20. Return A.
      return A;
    };
  })();
}

// Convertir objet -> array
function _toConsumableArray(arr) {
  return (
    _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread()
  );
}

function _nonIterableSpread() {
  throw new TypeError("Invalid attempt to spread non-iterable instance");
}

function _iterableToArray(iter) {
  if (
    Symbol.iterator in Object(iter) ||
    Object.prototype.toString.call(iter) === "[object Arguments]"
  )
    return Array.from(iter);
}

function _arrayWithoutHoles(arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) {
      arr2[i] = arr[i];
    }
    return arr2;
  }
}

window.addEventListener(
  "load",
  function (event) {
    A2ta.init();
  },
  false
);
