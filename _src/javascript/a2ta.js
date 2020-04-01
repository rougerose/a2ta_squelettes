var A2ta = {
	init: function() {
		(this.body = $("body")),
			(this.loadingIntroContainer = $("#loadingIntro")),
			this.body.addClass("is-page-ready"),
			this.menu(),
			this.loadingIntro(),
			this.loadingIntroEvents();
	},

	menu: function() {
		var $hamburger = $("#hamburger");
		$hamburger.on("click", function() {
			$hamburger.toggleClass("is-active");
		});
	},

	loadingIntro: function() {
		if (this.loadingIntroContainer.hasClass("is-visible")) {
			this.body.addClass("is-locked");
		}
	},

	loadingIntroEvents: function() {
		var container = this.loadingIntroContainer[0];
		container.addEventListener("swiped-up", hideLoadingIntro);
		container.addEventListener("click", hideLoadingIntro);

		function hideLoadingIntro(event) {
			container.removeEventListener("swiped-up", hideLoadingIntro);
			container.removeEventListener("click", hideLoadingIntro);
			container.classList.remove("is-visible");
			container.classList.add("is-hidden");
			container.parentNode.classList.remove("is-locked");
		}
	}
};

$(function() {
	A2ta.init();
});
