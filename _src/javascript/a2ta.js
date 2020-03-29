
var a2ta = {
	body: null,
	init: function() {
		this.body = $("body"),
		this.loading();
	},

	loading: function() {
		var e;
		swipedetect($("#loading")[0], function(){
			return e(), false;
		});
		e = function() {
			$("#loading").addClass("is-hidden");
		}

	}
}


$(function() {
	a2ta.init();

	//
	// Chargement de la page effectué
	// var $body = $("body");
	// $body.addClass("is-page-ready");

	// document.addEventListener("wheel", (evt) => {
	// 	console.log(evt);
	// 	// … do stuff with evt
	// }, { capture: false, passive: true})

	// var scrolling = false;

	// $( window ).on("wheel mousewheel", function() {
	// 	scrolling = true;
	// });
	//
	// setInterval( function() {
	// 	if ( scrolling ) {
	// 		scrolling = false;
	// 		console.log(event);
	// 		// Do your thang!
	// 	}
	// }, 250 );



	// $(window).on("wheel mousewheel", function(event) {
	// 	return $("#loading:hover").length && event.originalEvent.deltaY > 0 ? ($("#loading").addClass("is-hidden"), setTimeout(function() {
	// 		return setTimeout(function() {return $("body").removeClass("is-locked");}, 100)
	// 	}, 900)) : void 0;
	// });


	//
	// Menu hamburgers
	// -------------------------------------
	// var $hamburger = $("#hamburger");
	//
	// $hamburger.on("click", function() {
	// 	$hamburger.toggleClass("is-active");
	// });
});
