var A2taMap = {
	self: {},
	carte: {},
	carteDefaultCenter: [],
	carteDefaultZoom: "",
	criteresLabelRecherche: [],
	criteresIdRecherche: [],
	containerlistCriteres: {},
	inputCarteRechercheLibre: {},
	listAutocompleteResponse: {},

	init: function (mapObject) {
		self = this;
		self.carte = mapObject;
		self.carteDefaultZoom = self.carte.options.zoom;
		self.carteDefaultCenter = self.carte.options.center;
		self.setZoomControl();
		self.containerlistCriteres = $("#listCriteres");
		self.inputCarteRechercheLibre = $("#input-carte-recherche-libre");
		self.listAutocompleteResponse = $("#listAutocompleteResponse");
		self.searchInit();
		$(self.ready);
	},

	ready: function () {
		self.rechercheLibreNoResult();
	},

	searchInit: function () {
		var search = document.body.querySelector(".map-TabsSearch"),
			searchCategories = search.querySelector("#mapSearchCategoriesSection"),
			triggerCategories = search.querySelector("#mapTriggerCategories");

		const buildScroll = function () {
			buildScrollableElement(searchCategories);
		};
		triggerCategories.addEventListener("click", buildScroll, false);
	},

	setZoomControl: function () {
		self.carte.options.zoomControl = false;
		L.control.zoom({ position: "bottomleft" }).addTo(self.carte);
	},

	rechercheLibreCb: function (event, ui) {
		var critereValue = ui.item.value,
			critereLabel = ui.item.label,
			dejaPresent = self.criteresIdRecherche.indexOf(critereValue);

		if (dejaPresent == -1) {
			self.criteresLabelRecherche.push(critereLabel);
			self.criteresIdRecherche.push(critereValue);
			self.afficherCriteres();
		}

		this.value = "";

		// Bloquer le fonctionnement par défaut sur select event.
		return false;
	},

	afficherCriteres: function () {
		var listCriteres = '<ul class="o-list-bare c-carte__criteres">';

		for (var i = 0; i < self.criteresLabelRecherche.length; i++) {
			listCriteres +=
				'<li class="o-list-bare__item c-carte__critere">' +
				'<span class="c-carte__critere-label">' +
				self.criteresLabelRecherche[i] +
				"</span>" +
				'<button id="critereDelete' +
				i +
				'" class="c-btn c-carte__critere-btn"></button></li>';
		}

		listCriteres += "</ul>";
		self.containerlistCriteres.html(listCriteres);
		$(".c-carte__critere-btn").click(function () {
			var index = this.id.substring(13);
			self.criteresLabelRecherche.splice(index, 1);
			self.criteresIdRecherche.splice(index, 1);
			self.afficherCriteres();
		});
		self.chargerGeoPoints();
	},

	chargerGeoPoints: function () {
		self.carte.removeAllMarkers();
		var parametres = { id_association: [], id_mot: [], ville: [], limit: 500 };

		// Construire la requête.
		// Les critères sont stockés ainsi :
		// "id_nomObjet:identifiant numérique objet".
		for (var i = 0; i < self.criteresIdRecherche.length; i++) {
			var p = self.criteresIdRecherche[i].split(":");

			for (var property in parametres) {
				var k = p[0],
					l = parametres[k].length;

				if (property === k) {
					parametres[k][l] = p[1];
				}
			}
		}

		var query = $.param(parametres);

		// Récupérer les id_association à partir des critères de recherche
		$.getJSON("http.api/collectionjson/associations" + "?" + query)
			.done(function (json) {
				var associationsList = { id_association: [] };

				$.each(json.collection.items, function (key, item) {
					associationsList.id_association[key] = item.data[0].value;
				});
				// Récupérer les infos de géolocalisation
				// depuis le squelette "json/gis_associations_env"
				var query = $.param(associationsList);
				$.getJSON(
					"?page=gis_json&objets=associations_env&limit=500&" + query
				).done(function (json) {
					self.parseJson(json);
					// S'il n'y a plus de critères de recherche,
					// afficher la vue par défaut de la carte.
					if (self.criteresIdRecherche.length == 0) {
						self.carte.setView(self.carteDefaultCenter, self.carteDefaultZoom);
					}
				});
			})
			.fail(function (jqxhr, textStatus, error) {
				var message = self.getMessageNoResult();
				self.containerlistCriteres.append(message);
			});
	},

	rechercheLibreNoResult: function () {
		// Calculer la largeur du container.
		// TODO: Vérifier la largeur sur le resize ou autres événements ?
		var width = self.inputCarteRechercheLibre.outerWidth();

		self.inputCarteRechercheLibre.on("autocompleteresponse", function (
			event,
			ui
		) {
			if (!ui.content.length) {
				var inputVal = this.value;

				if (inputVal) {
					self.listAutocompleteResponse.css("width", width + "px");
					var message = self.getMessageNoResult(inputVal);
					self.listAutocompleteResponse.html(message);
					$(this).on("blur", self.cancelMessageNoResult);
					// $(this).off("blur", self.cancelMessageNoResult);
				}
			} else {
				self.cancelMessageNoResult();
			}
		});
	},

	getMessageNoResult: function (value) {
		var message = "",
			messageTxt = "";

		if (value) {
			messageTxt = "Aucun résultat pour « " + value + " »";
		} else {
			messageTxt = "Aucun résultat";
		}

		message = '<div id="infoNoResult" class="c-message c-message--info">';
		message += messageTxt;
		message += "</div>";

		return message;
	},

	cancelMessageNoResult: function () {
		$("#infoNoResult").css("display", "none");
	},

	// Collecter les points.
	// ---------------------
	// Utiliser une fonction spécifique, plutôt que celle proposée par
	// GIS, car cette dernière prendre en compte des options de zoom
	// et de centre ("centerAndZoom") par défaut du plugin difficiles
	// à maîtriser.
	parseJson: function (json) {
		var map = self.carte;
		var markers = [];
		map.markerCluster = L.markerClusterGroup(map.options.clusterOptions).addTo(
			map
		);
		$.each(json.features, function (i, feature) {
			if (
				feature.geometry.type === "Point" &&
				feature.geometry.coordinates[0]
			) {
				var marker = L.marker([
					feature.geometry.coordinates[1],
					feature.geometry.coordinates[0],
				]);
				map.setGeoJsonFeatureIcon(feature, marker);
				map.setGeoJsonFeaturePopup(feature, marker);
				marker.feature = feature;
				// marker.id = feature.id;
				markers.push(marker);
			}
		});
		map.markerCluster.addLayers(markers);
		var bounds = map.markerCluster.getBounds();
		var options = { maxZoom: 16 };
		map.fitBounds(bounds, options);
	},
};
