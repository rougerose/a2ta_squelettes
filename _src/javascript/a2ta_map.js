var A2taMap = {
	jqCarte: {},
	objCarte: {},
	self: {},
	init: function (mapObject) {
		self = this;
		self.objCarte = mapObject;
		self.setZoomControl();
	},

	setZoomControl: function () {
		self.objCarte.options.zoomControl = false;
		L.control.zoom({ position: "bottomleft" }).addTo(self.objCarte);
	},

	// Utiliser une fonction spécifique qui reprend l'essentiel
	// de la fonction parseGeoJson de GIS mais sans les options
	// de zoom, difficile à maîtriser et qui sont ajoutées par GIS
	// dans centerAndZoom
	parseJson: function (json) {
		var map = self.objCarte;
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
				marker.id = feature.id;
				markers.push(marker);
			}
		});
		map.markerCluster.addLayers(markers);
		var bounds = map.markerCluster.getBounds();
		map.fitBounds(bounds);
	},
};
