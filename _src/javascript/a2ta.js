var A2ta = {
	init: function() {
		(this.body = $("body")),
			(this.loadingContainer = $("#loading")),
			this.body.addClass("is-page-ready"),
			this.menu(),
			this.loading(),
			this.loadingEvents();
	},

	menu: function() {
		var $hamburger = $("#hamburger");
		$hamburger.on("click", function() {
			$hamburger.toggleClass("is-active");
		});
	},

	loading: function() {
		if (this.loadingContainer.hasClass("is-visible")) {
			this.body.addClass("is-locked");
		}
	},

	loadingEvents: function() {
		var container = this.loadingContainer[0];
		container.addEventListener("swiped-up", hideLoading);
		container.addEventListener("click", hideLoading);

		function hideLoading(event) {
			container.removeEventListener("swiped-up", hideLoading);
			container.removeEventListener("click", hideLoading);
			container.classList.remove("is-visible");
			container.classList.add("is-hidden");
			container.parentNode.classList.remove("is-locked");
		}
	}
};

$(function() {
	A2ta.init();
});
