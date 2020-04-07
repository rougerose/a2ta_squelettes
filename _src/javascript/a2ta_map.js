function a2ta_map(mapObject) {
	var id = mapObject.options.mapId,
		Map = $("#map" + id);
	Map.on("ready", function() {
		this.map.zoomControl.setPosition("topright");
	});
}
