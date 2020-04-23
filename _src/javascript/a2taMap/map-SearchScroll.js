// Adapté de https://medium.com/@sbastienperrot/comment-mettre-en-place-une-scrollbar-universelle-en-pur-javascript-8af0f522cad6

var buildScrollableElement = function (elt) {
	var scrollableContainer = elt.firstElementChild,
		scrollbar = elt.querySelector(".map-SearchScroll_Scrollbar"),
		scrollbarFill = elt.querySelector(".map-SearchScroll_ScrollbarFill"),
		boxSize = elt.clientWidth,
		scrollSize = scrollableContainer.scrollWidth,
		toScrollSize = scrollSize - boxSize,
		scrollbarSize = 0;

	// Définir la taille de la scrollbar et de son conteneur
	scrollbarFill.style.transform = "translate3d(0, 0, 0)";
	scrollbarFill.style.width = 100 * (boxSize / scrollSize) + "%";
	scrollbarSize = scrollbarFill.clientWidth;
	scrollbarFill.style.zIndex = boxSize >= scrollSize ? -1 : 2;
	scrollbar.style.zIndex = boxSize >= scrollSize ? -1 : 1;

	// Déplacement de la scrollbar avec le scroll
	var rafTimer, scrollPosition;

	const setScroll = function () {
		scrollbarFill.style.transform =
			"translate3d(" + scrollPosition + "px, 0, 0)";
	};

	scrollableContainer.addEventListener("scroll", function (event) {
		cancelAnimationFrame(rafTimer);
		scrollPosition = boxSize * (event.target.scrollLeft / scrollSize);
		rafTimer = requestAnimationFrame(setScroll);
	});

	// Click sur la scrollbar
	const onScrollbarClick = function (event) {
		scrollableContainer.scrollLeft = scrollSize * (event.offsetX / boxSize);
	};
	scrollbar.addEventListener("mousedown", onScrollbarClick, false);

	// Drag & Drop sur la scrollbar
	var offsetStart = null;

	const onScrollbarFillMousedown = function (event) {
		event.preventDefault();
		event.stopPropagation();
		offsetStart =
			event.offsetX + scrollableContainer.getBoundingClientRect().left;
		elt.addEventListener("mousemove", onScrollbarFillMousemove, false);
		elt.addEventListener("mouseup", onScrollbarFillMouseup, false);
	};

	const onScrollbarFillMousemove = function (event) {
		event.preventDefault();
		event.stopPropagation();
		scrollableContainer.scrollLeft =
			scrollSize * ((event.clientX - offsetStart) / boxSize);
	};

	const onScrollbarFillMouseup = function (event) {
		event.preventDefault();
		event.stopPropagation();
		elt.removeEventListener("mousemove", onScrollbarFillMousemove);
		elt.removeEventListener("mouseup", onScrollbarFillMousemove);
	};

	scrollbarFill.addEventListener("mousedown", onScrollbarFillMousedown, false);
};
