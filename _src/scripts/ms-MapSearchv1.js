var MapSearch = {
	rootEl: {},
	advancedTriggerEl: {},
	advancedOptionsContainer: {},
	advancedOptionsList: {},
	optionTriggers: {},
	optionEls: {},
	advancedTriggerID: "#searchAdvancedTrigger",
	rootElHeight: "",
	advancedOptionsContainerHeight: "",

	init: function (rootEl) {
		this.rootEl = rootEl;
		this.rootElHeight = this.rootEl.clientHeight;
		this.rootEl.style.height = this.rootElHeight + "px";
		this.advancedTriggerEl = this.rootEl.querySelector(this.advancedTriggerID);
		var triggerTarget = this.advancedTriggerEl.getAttribute("aria-controls");
		this.advancedOptionsContainer = this.rootEl.querySelector(
			"#" + triggerTarget
		);
		this.advancedOptionsContainerHeight = this.advancedOptionsContainer.clientHeight;
		this.advancedOptionsList = this.advancedOptionsContainer.children[0];

		this.initAdvancedTrigger();
		this.initAvancedToggle();
		this.initOptionsTriggers();
	},

	initAdvancedTrigger: function () {
		// Affichage par défaut
		this.advancedTriggerEl.setAttribute(
			"aria-expanded",
			!this.getExpanded(this.advancedTriggerEl)
		);

		// TriggerElement Click Event
		this.advancedTriggerEl.addEventListener(
			"click",
			this.handlerAdvancedTriggerClick.bind(this),
			false
		);
	},

	initAvancedToggle: function () {
		var isExpanded = this.getExpanded(this.advancedTriggerEl),
			isInOut = isExpanded ? "isOut" : "isIn";

		this.advancedOptionsContainer.setAttribute("aria-hidden", isExpanded);
		this.advancedOptionsList.dataset.state = isInOut;
	},

	initOptionsTriggers: function () {
		this.optionTriggers = this.advancedOptionsList.getElementsByTagName(
			"button"
		);

		for (var trigger of this.optionTriggers) {
			// Identifier et enregistrer les options
			var controlID = this.getControlID(trigger);
			this.optionEls[controlID] = this.rootEl.querySelector("#" + controlID);

			// États par défaut
			var isExpanded = this.getExpanded(trigger),
				optionEl = this.optionEls[controlID];
			trigger.setAttribute("aria-expanded", !isExpanded);
			optionEl.setAttribute("aria-hidden", isExpanded);

			// Click Event
			trigger.addEventListener(
				"click",
				this.handlerOptionTriggersClick.bind(this)
			);
		}
	},

	handlerAdvancedTriggerClick: function (event) {
		var trigger = event.target,
			isExpanded = this.getExpanded(trigger),
			isInOut = isExpanded ? "isIn" : "isOut";

		if (!isExpanded) {
			// refermer les éléments enfants éventuellement ouverts
			this.setOptionState(!isExpanded);
		}

		trigger.setAttribute("aria-expanded", isExpanded);
		this.advancedOptionsList.dataset.state = isInOut;
		this.advancedOptionsContainer.setAttribute("aria-hidden", !isExpanded);
	},

	handlerOptionTriggersClick: function (event) {
		var target = event.target,
			isExpanded = "true";

		// Modifier la hauteur du conteneur principal
		var controlID = this.getControlID(target);
		var optionEl = this.optionEls[controlID];
		var height = optionEl.clientHeight;
		this.rootEl.style.height = this.rootElHeight + height + "px";
		// Modifier la position de l'élément à afficher
		optionEl.style.transform = "translate3d(0, " + this.rootElHeight + "px, 0)";

		// Modifier l'état des éléments controllés par le déclencheur
		this.setOptionState(isExpanded, target);
	},

	getExpanded: function (el) {
		return el.getAttribute("aria-expanded") === "false";
	},

	getControlID: function (el) {
		return el.getAttribute("aria-controls");
	},

	setOptionState: function (value, target) {
		var isExpanded = value,
			target = target || null;

		for (var trigger of this.optionTriggers) {
			var controlID = this.getControlID(trigger),
				optionEl = this.optionEls[controlID];

			if (target !== null && trigger.id === target.id) {
				target.setAttribute("aria-expanded", isExpanded);
				optionEl.setAttribute("aria-hidden", !isExpanded);
			} else {
				trigger.setAttribute("aria-expanded", !isExpanded);
				optionEl.setAttribute("aria-hidden", isExpanded);
			}
		}
	},
};
