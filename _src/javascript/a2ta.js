var A2ta = {
	init: function () {
		(this.body = $("body")),
			(this.loadingIntroContainer = $("#loadingIntro")),
			(this.header = $("#header")),
			(this.footer = $("#footer")),
			(this.contentItems = $("section.js-items .js-item")),
			this.body.addClass("is-page-ready"),
			this.prepareHeader(),
			this.loadingContent(),
			this.loadingIntro(),
			this.loadingIntroEvents(),
			this.prepareItems(),
			this.menuTrigger();
	},

	prepareHeader: function () {
		var header = this.header;
		this.headerHeight = header.outerHeight();
		this.deltaHeader = 5;
		this.lastScrollTop = 0;
	},

	// https://medium.com/@mariusc23/hide-header-on-scroll-down-show-on-scroll-up-67bbaae9a78c
	toggleHeader: function () {
		var st = window.scrollY;

		if (Math.abs(A2ta.lastScrollTop - st) <= A2ta.deltaHeader) {
			return;
		}

		if (st > A2ta.lastScrollTop && st > A2ta.headerHeight) {
			A2ta.header[0].classList.remove("is-visible");
			A2ta.header[0].classList.add("is-hidden");
		} else {
			if (st + window.innerHeight < document.documentElement.offsetHeight) {
				A2ta.header[0].classList.remove("is-hidden");
				A2ta.header[0].classList.add("is-visible");
			}
		}
		A2ta.lastScrollTop = st;
	},

	loadingContent: function () {
		if (this.loadingIntroContainer[0].classList.contains("is-hidden")) {
			var els = [this.contentItems, this.header, this.footer];

			// Ajouter la hauteur du pied de page en marge basse de l'élément body.
			this.body.css({ "padding-bottom": this.footer.css("height") });

			setTimeout(function () {
				$.each(els, function () {
					$(this).addClass("is-visible");
				});
			}, 900);
		}
	},

	loadingIntro: function () {
		if (this.loadingIntroContainer.hasClass("is-visible")) {
			this.body.addClass("is-locked");
		}
	},

	loadingIntroEvents: function () {
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

	prepareItems: function () {
		var decalage = $(window).height() / 4;
		$.each(this.contentItems, function () {
			$(this).css({ transform: "translateY(" + decalage + "px)" });
		});
	},

	menuTrigger: function () {
		var $hamburger = $("#hamburger");
		$hamburger.on("click", function () {
			$hamburger.toggleClass("is-active");
		});
	},
};

$(function () {
	A2ta.init();
	// https://remysharp.com/2017/06/28/sticky-headers
	var rafTimer;
	window.onscroll = function (event) {
		cancelAnimationFrame(rafTimer);
		rafTimer = requestAnimationFrame(A2ta.toggleHeader);
	};
});
