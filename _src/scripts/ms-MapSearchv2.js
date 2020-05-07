var MapSearch = {
	rootEl: {},
	// GROUPE 1
	searchTriggerID: "searchTrigger",
	searchPanelClass: ".ms-SearchPanel-js",
	searchPanel: {},
	panelActiveID: "searchFulltext",

	// Init
	init: function (rootEl) {
		var _this = this;
		this.rootEl = rootEl;
		// Premier groupe : Un bouton affiche/masque le second groupe.
		// Lors de son passage à l'état off, le bouton commandera la remise à zéro du second groupe.
		var searchTrigger = _this.rootEl.querySelector("#" + _this.searchTriggerID);
		// var panels = _this.rootEl.querySelectorAll(_this.searchPanelClass);
		// panels.forEach(function (panel) {
		// 	_this.resetPanel(panel);
		//
		// 	if (panel.id == _this.panelActiveID) {
		// 		_this.showPanel(panel);
		// 		// TODO: Descendre jusqu'aux panneaux enfants ?
		// 	}
		// });
		var controlID = searchTrigger.getAttribute("aria-controls");
		this.searchPanel = _this.rootEl.querySelector("#" + controlID);
		// État par défaut du bouton et du bloc lié
		this.resetTrigger(searchTrigger);
		this.resetPanel(this.searchPanel);

		searchTrigger.addEventListener(
			"click",
			this.togglePanels.bind(this),
			false
		);

		// Second groupe : Recherche avancée sous forme de Tabs
	},

	activatePanel: function (panel) {
		panel.setAttribute("aria-hidden", "false");
	},

	activateTrigger: function (trigger) {
		trigger.setAttribute("aria-expanded", "true");
	},

	getActiveIndex: function (el, index) {},

	getTriggerState: function (trigger) {
		return trigger.getAttribute("aria-expanded") == "true";
	},

	getPanelState: function (panel) {
		return panel.getAttribute("aria-hidden") == "false";
	},

	resetPanel: function (panel) {
		panel.setAttribute("aria-hidden", "true");
	},

	resetTrigger: function (trigger) {
		trigger.setAttribute("aria-expanded", "false");
	},

	setBusyState: function (el, boolean) {
		el.setAttribute("aria-busy", boolean);
	},

	togglePanels: function (event) {
		var _this = this,
			trigger = event.target,
			isExpanded = _this.getTriggerState(trigger);
		console.log(isExpanded);
		if (!isExpanded) {
			trigger.setAttribute("aria-expanded", "true");
			_this.showPanel(_this.searchPanel);
		} else {
			trigger.setAttribute("aria-expanded", "false");
			_this.hidePanel(_this.searchPanel);
		}

		// if (trigger.id == this.searchTriggerID) {
		// 	if (isExpanded) {
		// 		var items = _this.rootEl.children;
		// 		for (var item of items) {
		// 			if (item.tagName == "DIV") {
		// 				var isVisible = _this.getPanelState(item);
		// 				// isVisible ? _this.hidePanel(item) : "";
		// 				// isVisible ? "" : _this.showPanel(item);
		// 				// isVisible ? _this.hidePanel(item) : _this.showPanel(item);
		// 			}
		// 		}
		// 	}
		// }

		// 1- Si bouton du premier groupe
		// 2- Si bouton fermé
		// 	2A- Récupérer les div du premier groupe
		// 	3A- Cacher le div visible ; afficher le div caché.
		// 3- Si bouton ouvert
		// 	3A- Récupérer les div du deuxième groupe
		// 	3B- les fermer
		// 	3C- Cacher le div visible ; Afficher le div caché.
		//
	},

	showPanel: function (panel) {
		// panel.removeEventListener("transitionend", complete, false);
		// TODO: Déplacer l'activation du trigger
		// this.activateTrigger(trigger);
		// this.setBusyState(panel, true);
		var scrollHeight = panel.scrollHeight;
		panel.addEventListener(
			"transitionend",
			function (event) {
				return this.showComplete(event);
			},
			false
		);
		this.activatePanel(panel);
		panel.style.height = scrollHeight + "px";

		function completeShow() {
			// panel.setAttribute("aria-busy", "false");
			panel.style.height = "";
			// panel.removeEventListener("transitionend", completeShow, false);
			// console.log("complete show");
		}
	},

	showComplete: function (event) {
		this.searchPanel.removeEventListener(
			"transitionend",
			function (event) {
				return this.showComplete(event);
			},
			false
		);
	},

	hidePanel: function (panel) {
		// console.log(panel.getBoundingClientRect());
		panel.style.height = panel.getBoundingClientRect().height + "px";
		panel.addEventListener("transitionend", completeHide, false);
		// this.setBusyState(panel, true);
		panel.style.height = 0 + "px";
		// this.resetPanel(panel);

		function completeHide(event) {
			// _this.setBusyState(el, false);
			panel.style.height = "";
			panel.removeEventListener("transitionend", completeHide, false);
			console.log("complete hide");
		}

		// function complete(event) {
		// 	// var _this = this;
		// 	// el = event.target;
		// 	// _this.setBusyState(el, false);
		// 	e.style.height = "";
		// 	el.removeEventListener("transitionend", complete, false);
		// 	console.log(complete);
		// }
	},

	// Afficher :
	// 1- ajouter une classe "collapsing" (état intermédiaire)
	// 2- hauteur de l'élément à 0;
	// 3- récupérer scrollHeigth de l'élément
	// 4- animation de la hauteur à la valeur scrollheight
	// 3- callback à la fin de l'animation : supprimer la classe collapsing, ajouter classe état affiché, hauteur à une valeur ""
	//
};

window.addEventListener(
	"load",
	function (event) {
		var mapSearchEl = document.querySelector("#mapSearch");

		if (mapSearchEl) {
			// var mapSearchObj = Object.create(MapSearch);
			MapSearch.init(mapSearchEl);
		}
	},
	false
);
