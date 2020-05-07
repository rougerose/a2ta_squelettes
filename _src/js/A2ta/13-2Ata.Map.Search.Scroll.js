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
