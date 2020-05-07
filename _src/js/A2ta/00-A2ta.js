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
