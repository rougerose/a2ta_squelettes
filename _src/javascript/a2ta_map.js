var A2taMap = {
	self: {},
	carte: {},
	criteresLabelRecherche: [],
	criteresIdRecherche: [],
	containerlistCriteres: {},
	inputCarteRechercheLibre: {},
	listAcResponse: {},
	init: function (mapObject) {
		self = this;
		self.carte = mapObject;
		self.setZoomControl();
		self.containerlistCriteres = $("#listCriteres");
		self.inputCarteRechercheLibre = $("#input-carte-recherche-libre");
		self.listAcResponse = $("#listAutocompleteResponse");
		$(self.ready);
	},

	ready: function () {
		self.rechercheLibreNoResult();
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

		// empêcher de poursuivre avec le fonctionnement
		// par défaut sur l'événement select
		return false;
	},

	afficherCriteres: function () {
		var listCriteres = '<ul class="o-list-bare c-carte__criteres">';

		for (var i = 0; i < self.criteresLabelRecherche.length; i++) {
			listCriteres +=
				'<li class="o-liste-bare__item c-carte__critere">' +
				'<span class="c-carte__critere-label">' +
				self.criteresLabelRecherche[i] +
				"</span>" +
				'<button id="critereDelete' +
				i +
				'" class="c-btn c-carte__critere-btn"></button></li>';
		}

		listCriteres += "</ul>";
		self.containerlistCriteres.html(listCriteres);
		self.chargerGeoPoints();
	},

	chargerGeoPoints: function () {
		self.carte.removeAllMarkers();
		var parametres = { id_association: [], id_mot: [], ville: [], limit: 500 };

		// Construire la requête. Les critères sont stockés ainsi :
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
				// Récupérer les infos de géolocalisation depuis le squelette
				// json/gis_associations_env
				var query = $.param(associationsList);
				$.getJSON(
					"?page=gis_json&objets=associations_env&limit=500&" + query
				).done(function (json) {
					self.parseJson(json);
				});
			})
			.fail(function (jqxhr, textStatus, error) {
				var message = getMessageInfoNoResult();
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
					self.listAcResponse.css("width", width + "px");
					var message = self.getMessageNoResult(inputVal);
					self.listAcResponse.html(message);
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
			messageT = "";

		if (value) {
			messageT = "Aucun résultat pour « " + value + " »";
		} else {
			messageT = "Aucun résultat";
		}

		message = '<div id="infoNoResult" class="c-message c-message--info">';
		message += messageT;
		message += "</div>";

		return message;
	},

	cancelMessageNoResult: function () {
		$("#infoNoResult").css("display", "none");
	},

	// Utiliser une fonction spécifique qui reprend l'essentiel
	// de la fonction parseGeoJson de GIS mais sans les options
	// de zoom, difficile à maîtriser et qui sont ajoutées par GIS
	// dans centerAndZoom
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
