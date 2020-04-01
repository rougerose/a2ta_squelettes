var A2ta = {
	init: function() {
		(this.body = $("body")),
			(this.loadingIntroContainer = $("#loadingIntro")),
			(this.header = $("#header")),
			(this.contentItems = $("section.js-items .js-item")),
			this.body.addClass("is-page-ready"),
			this.loadingContent(),
			this.loadingIntro(),
			this.loadingIntroEvents(),
			this.prepareItems(),
			this.menuTrigger();
	},

	loadingContent: function() {
		if (this.loadingIntroContainer[0].classList.contains("is-hidden")) {
			var header = this.header[0],
				items = this.contentItems;
			setTimeout(function() {
				header.classList.add("is-visible");
				$.each(items, function() {
					$(this).addClass("is-visible");
				});
			}, 900);
		}
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
			A2ta.loadingContent();
		}
	},

	prepareItems: function() {
		var decalage = $(window).height() / 4;
		$.each(this.contentItems, function() {
			$(this).css({ transform: "translateY(" + decalage + "px)" });
		});
	},

	menuTrigger: function() {
		var $hamburger = $("#hamburger");
		$hamburger.on("click", function() {
			$hamburger.toggleClass("is-active");
		});
	}
};

$(function() {
	A2ta.init();
});
