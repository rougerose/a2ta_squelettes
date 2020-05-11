A2ta.Map = A2ta.Map || {};

A2ta.Map = (function () {
  var map = null;
  var container = null;
  var sidebar = null;

  function init(mapObj) {
    map = mapObj;
    chargerGeoPoints();
    setZoomControl(map);
    A2ta.config.map.defaultLat = map.options.center[0];
    A2ta.config.map.defaultLng = map.options.center[1];
    A2ta.config.map.defaultZoom = map.options.zoom;
    container = document.getElementById(A2ta.config.map.containerID);
    addSidebar(map);
    A2ta.Map.Search.init();
  }

  function addSidebar(mapObj) {
    var sidebarDom = document.createElement("div");
    sidebarDom.id = "sidebar";
    container.appendChild(sidebarDom);

    sidebar = L.control.sidebar("sidebar", {
      position: "right",
      closeButton: true,
    });

    mapObj.addControl(sidebar);
    // setTimeout(function () {
    //   sidebar.show();
    // }, 500);
  }

  function setZoomControl(mapObj) {
    // Position par défaut du zoom est désactivée. Puis définie à nouveau.
    mapObj.options.zoomControl = false;
    L.control.zoom({ position: "bottomleft" }).addTo(mapObj);
  }

  function chargerGeoPoints(keywords) {
    if (Array.isArray(keywords) && keywords.length) {
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
          var url =
            "?page=gis_json&objets=recherche_associations&limit=500&" + q;

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
      console.log(url);
      $.getJSON(url).done(function (json) {
        parseJson(json, true);
      });
    }
  }

  /**
   * Afficher les points de géolocalisation
   *
   * Fonction dérivée et simplifiée de celle disponible
   * dans l'API de GIS, mais sans les options
   * de zoom et de centre (centerAndZoom).
   */
  function parseJson(json, reset) {
    var defaultView = reset;

    // TODO: prévoir un traitement spécifique également.
    if (!map.options.cluster) {
      map.parseGeoJsonFeatures(data);
    } else {
      var markers = [];
      var autres = {
        type: "FeatureCollection",
        features: [],
      };
      map.markerCluster = L.markerClusterGroup(
        map.options.clusterOptions
      ).addTo(map);

      $.each(json.features, function (i, feature) {
        if (
          feature.geometry.type === "Point" &&
          feature.geometry.coordinates[0]
        ) {
          var markerOptions = {};
          var marker = L.marker(
            [feature.geometry.coordinates[1], feature.geometry.coordinates[0]],
            markerOptions
          );
          // Gérer le clic = charger le contenu dans la sidebar
          marker.on("click", handleClickOnMarker);
          // Les icones : utiliser pour le moment la fonction standard de GIS
          map.setGeoJsonFeatureIcon(feature, marker);
          // map.setGeoJsonFeaturePopup(feature, marker);
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
  }

  function handleClickOnMarker(event) {
    var marker = event.target;
    var content = setSidebarContent(marker.feature);
    sidebar.setContent(content);
    if (!sidebar.isVisible()) {
      sidebar.show();
    }
  }

  function setSidebarContent(feature) {
    var orgClass = A2ta.config.org;

    // Conteneur et titre
    var content = document.createElement("div"),
      header = document.createElement("div"),
      title = document.createElement("h2");

    content.className = orgClass.container;
    header.className = orgClass.header;
    title.className = orgClass.title;
    title.innerText = feature.properties.title;
    header.appendChild(title);
    content.appendChild(header);

    // Membre FRAAP
    var member = feature.properties.fraapmember;
    if (member) {
      var memberSpan = document.createElement("span");
      memberSpan.className = orgClass.member;
      memberSpan.innerText = "Fraap";
      header.appendChild(memberSpan);
    }

    // Sites et réseaux
    var web = document.createElement("div"),
      sites = document.createElement("div"),
      social = document.createElement("div");

    web.className = orgClass.web;
    sites.className = orgClass.websites;
    social.className = orgClass.social;

    var links = {
      website1: feature.properties.website1,
      website2: feature.properties.website2,
      facebook: feature.properties.facebook,
      twitter: feature.properties.twitter,
      instagram: feature.properties.instagram,
    };

    var link;
    for (link in links) {
      if (/^website/.test(link)) {
        // Website
        if (links[link]) {
          // Si l'url existe -> ahref
          var a = document.createElement("a");
          a.href = links[link];
          a.innerText = links[link];
        } else {
          // Sinon -> span
          var a = document.createElement("span");
        }
        a.className = orgClass.webLink;
        sites.appendChild(a);
      } else {
        // Réseaux
        if (links[link]) {
          // Même schéma que ci-dessus
          var a = document.createElement("a");
          a.href = links[link];
        } else {
          var a = document.createElement("span");
        }
        a.className = orgClass.socialLink;
        a.classList.add(orgClass.socialLink + "-" + link);
        social.appendChild(a);
      }
    }

    web.appendChild(sites);
    web.appendChild(social);
    content.appendChild(web);

    // Localisation
    var address = document.createElement("div");
    address.className = orgClass.address;

    var adressLines = {
      address1: feature.properties.address1,
      address2: feature.properties.address2,
      zip: feature.properties.postalcode + " " + feature.properties.city,
      departement: feature.properties.departement,
      region: feature.properties.region,
      country: feature.properties.country,
    };

    var line,
      i = 0;

    for (line in adressLines) {
      var l;
      if (i % 3 == 0) {
        var group = document.createElement("div");
        group.className = orgClass.addressGroup;
      }
      if (i == 4) {
        group.classList.add(orgClass.addressGroupCountry);
      }
      l = document.createElement("span");
      l.className = orgClass.adressLine;
      l.innerText = adressLines[line];
      group.appendChild(l);
      address.appendChild(group);
      i++;
    }

    content.appendChild(address);

    // Activités
    var activities = feature.properties.activities.split("|");

    if (activities.length > 0) {
      var ul = document.createElement("ul");
      ul.className = orgClass.activities;

      activities.forEach(function (activity) {
        var li = document.createElement("li");
        li.className = orgClass.activity;
        li.innerText = activity;
        ul.appendChild(li);
      });

      content.appendChild(ul);
    }
    return content;
  }

  // parseGeoJson: function (data) {
  // 	var map = this;
  // 	// Analyse des points et déclaration (sans regroupement des points en cluster)
  // 	if (!map.options.cluster) {
  // 		this.parseGeoJsonFeatures(data);
  // 	} else {
  // 		map.markerCluster = L.markerClusterGroup(map.options.clusterOptions).addTo(map);
  // 		var markers = [];
  // 		var autres = {
  // 			type: 'FeatureCollection',
  // 			features: []
  // 		};
  // 		/* Pour chaque points présents, on crée un marqueur */
  // 		jQuery.each(data.features, function (i, feature) {
  // 			if (feature.geometry.type == 'Point' && feature.geometry.coordinates[0]) {
  // 				var marker = L.marker([feature.geometry.coordinates[1], feature.geometry.coordinates[0]]);
  //
  // 				// Déclarer l'icone du point
  // 				map.setGeoJsonFeatureIcon(feature, marker);
  // 				// Déclarer le contenu de la popup s'il y en a
  // 				map.setGeoJsonFeaturePopup(feature, marker);
  //
  // 				// On garde en mémoire toute la feature d'origine dans le marker, comme sans clusters
  // 				marker.feature = feature;
  // 				// Pour compat, on continue de garde l'id à part
  // 				marker.id = feature.id;
  // 				markers.push(marker);
  // 			} else {
  // 				autres.features.push(feature);
  // 			}
  // 		});
  //
  // 		map.markerCluster.addLayers(markers);
  // 		this.parseGeoJsonFeatures(autres);
  //
  // 		if (map.options.autocenterandzoom) {
  // 			this.centerAndZoom(map.markerCluster.getBounds());
  // 		}
  // 		if (map.options.openId) {
  // 			gis_focus_marker(map.options.openId,map.options.mapId);
  // 		}
  // 	}
  // },

  return {
    init: init,
    chargerGeoPoints: chargerGeoPoints,
    getMapContainer: function () {
      return container;
    },
  };
})();
