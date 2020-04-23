// Fichier pour mémoire
// https://medium.com/@sbastienperrot/comment-mettre-en-place-une-scrollbar-universelle-en-pur-javascript-8af0f522cad6
(function () {
	const buildScrollableElement = function (elt) {
		let parent = document.getElementsByClassName("scrollwrapper")[0];

		let containerDOM = document.createElement("div");
		containerDOM.className = "Scrollable";

		const markup = `
			<div class="Scrollable__scrollbar"></div>
			<div class="Scrollable__scrollbar-fill"></div>
		`;

		containerDOM.style.width = elt.offsetWidth + "px";
		containerDOM.style.height = elt.style.height;
		containerDOM.innerHTML = markup;

		let scrollableContainerContent = document.createElement("div");
		scrollableContainerContent.className = "Scrollable__scrollable";

		let scrollableContainerContentElement = document.createElement(
			elt.localName
		);
		scrollableContainerContentElement.className = elt.className;
		scrollableContainerContentElement.id = elt.id;
		scrollableContainerContentElement.innerHTML = elt.innerHTML;

		scrollableContainerContent.appendChild(scrollableContainerContentElement);
		containerDOM.appendChild(scrollableContainerContent);
		parent.appendChild(containerDOM);
		parent.removeChild(elt);

		let scrollbarDOM = containerDOM.firstElementChild;
		let scrollbarFillDOM = scrollbarDOM.nextElementSibling;
		let scrollableDOM = containerDOM.lastElementChild;
		// console.log(scrollbarDOM, scrollbarFillDOM);
		let boxSize = scrollbarDOM.clientHeight;
		let scrollSize = scrollableDOM.scrollHeight;
		let toScrollSize = scrollSize - boxSize;
		let scrollbarSize;

		// 3. Initalize scrollbar fill
		scrollbarFillDOM.style.transform = "translate3d(0, 0, 0)";
		scrollbarFillDOM.style.height = 100 * (boxSize / scrollSize) + "%";
		scrollbarSize = scrollbarFillDOM.clientHeight;
		scrollbarFillDOM.style.zIndex = boxSize >= scrollSize ? -1 : 2;
		scrollbarDOM.style.zIndex = boxSize >= scrollSize ? -1 : 1;

		const setScroll = function ($event) {
			scrollbarFillDOM.style.transform =
				"translate3d(0, " +
				boxSize * ($event.target.scrollTop / scrollSize) +
				"px, 0)";
		};
		scrollableDOM.addEventListener("scroll", setScroll);

		const onScrollbarClick = function ($event) {
			scrollableDOM.scrollTop = scrollSize * ($event.offsetY / boxSize);
		};
		scrollbarDOM.addEventListener("mousedown", onScrollbarClick, false);

		let offsetStart = null;
		const onScrollbarFillMousedown = function ($event) {
			$event.preventDefault();
			$event.stopPropagation();
			offsetStart = $event.offsetY + containerDOM.getBoundingClientRect().top;
			window.addEventListener("mousemove", onScrollbarFillMousemove, false);
			window.addEventListener("mouseup", onScrollbarFillMouseup, false);
		};
		const onScrollbarFillMousemove = function ($event) {
			$event.preventDefault();
			$event.stopPropagation();
			scrollableDOM.scrollTop =
				scrollSize * (($event.clientY - offsetStart) / boxSize);
		};
		const onScrollbarFillMouseup = function ($event) {
			$event.preventDefault();
			$event.stopPropagation();
			window.removeEventListener("mousemove", onScrollbarFillMousemove);
			window.removeEventListener("mouseup", onScrollbarFillMouseup);
		};
		scrollbarFillDOM.addEventListener(
			"mousedown",
			onScrollbarFillMousedown,
			false
		);
	};
	window.onload = function () {
		let elements = Array.from(document.getElementsByClassName("scrollable"));
		elements.map(function (elt) {
			console.log(elt);
			buildScrollableElement(elt);
		});
	};
})();
