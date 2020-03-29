
var a2ta = {
	body: null,
	init: function() {
		this.body = $("body"),
		this.menu(),
		this.loading();
	},

	menu: function() {
		var $hamburger = $("#hamburger");
		$hamburger.on("click", function() {
			$hamburger.toggleClass("is-active");
		});
	},

	loading: function() {
		var $loadingContainer = $("#loading"),
				loadingContainer = $loadingContainer[0];

		loadingContainer.addEventListener('swiped-up', hideLoading);
		loadingContainer.addEventListener('click', hideLoading);

		this.body.addClass("is-page-ready");


		function hideLoading() {
			$loadingContainer.addClass("is-hidden");

			// Supprimer body.is-locked
			event.currentTarget.parentNode.classList.remove("is-locked");

			loadingContainer.removeEventListener('swiped-up', hideLoading);
			loadingContainer.removeEventListener('click', hideLoading);
		}
	},
}


$(function() {
	a2ta.init();
});
