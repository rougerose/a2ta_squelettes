A2ta.Map = A2ta.Map || {};

A2ta.Map = (function () {
  var map = null;
  var container = null;

  function init(mapObj) {
    map = mapObj;
    setZoomControl(map);
    A2ta.config.map.defaultLat = map.options.center[0];
    A2ta.config.map.defaultLng = map.options.center[1];
    A2ta.config.map.defaultZoom = map.options.zoom;
    container = document.getElementById(A2ta.config.map.containerID);

    A2ta.Map.Search.init();
  }

  function setZoomControl(mapObj) {
    // Position par défaut du zoom est désactivée. Puis définie à nouveau.
    mapObj.options.zoomControl = false;
    L.control.zoom({ position: "bottomleft" }).addTo(mapObj);
  }

  function chargerGeoPoints(keywords) {
    if (Array.isArray(keywords)) {
      if (keywords.length) {
        // Il y a au moins une association à afficher.
        var queryObject = {
          id_association: [],
          id_mot: [],
          ville: [],
          limit: 500,
        };

        map.removeAllMarkers();

        // Construire la requête à partir des mots-clés
        // demandés par l'utilisateur.

        for (var i = 0; i < keywords.length; i++) {
          var p = keywords[i].split(":");

          var property;
          for (property in queryObject) {
            var k = p[0];
            var l = queryObject[k].length;

            if (property === k) {
              queryObject[k][l] = p[1];
            }
          }
        }
        // Convertir l'objet en url (avec jquery)
        var query = $.param(queryObject);
        var url = "http.api/collectionjson/associations?";

        // à partir des mots-clés de la requête,
        // obtenir les id_association correspondants.
        $.getJSON(url + query)
          .done(function (json) {
            var associations = { id_association: [] };

            $.each(json.collection.items, function (key, item) {
              associations.id_association[key] = item.data[0].value;
            });

            // Récupérer les infos de géolocalisation des associations
            // depuis le squelette json/gis_associations_env
            var q = $.param(associations);
            var url = "?page=gis_json&objets=associations_env&limit=500&" + q;

            $.getJSON(url).done(function (json) {
              parseJson(json, false);
            });
          })
          .fail(function (jqxhr, textStatus, error) {
            var message = A2ta.Map.Search.getNoResultMessage();
            var keywordsContainer = document.querySelector(
              "#" + A2ta.config.keywords.containerID
            );
            keywordsContainer.appendChild(message);
          });
      } else {
        // Aucune association.
        // Afficher la carte dans sa position initiale
        // et avec toutes les associations disponibles.
        var url = "?page=gis_json&objets=associations&limit=500";
        $.getJSON(url).done(function (json) {
          parseJson(json, true);
        });
      }
    }
  }

  /**
   * Afficher les points de géolocalisation
   *
   * Fonction dérivée et simplifiée de celle disponible
   * dans l'API de GIS, mais qui n'utilise pas les options
   * de zoom et de centre (centerAndZoom) assez obscures.
   */
  function parseJson(json, reset) {
    var defaultView = reset;

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
        markers.push(marker);
      }
    });

    map.markerCluster.addLayers(markers);

    if (!reset) {
      var bounds = map.markerCluster.getBounds();
      var options = { maxZoom: 16 };
      map.fitBounds(bounds, options);
    } else {
      map.setView(
        [A2ta.config.map.defaultLat, A2ta.config.map.defaultLng],
        A2ta.config.map.defaultZoom
      );
    }
  }

  return {
    init: init,
    chargerGeoPoints: chargerGeoPoints,
    getMapContainer: function () {
      return container;
    },
  };
})();
