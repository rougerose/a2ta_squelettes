A2ta.Map = A2ta.Map || {};

A2ta.Map = (function () {
  var map = null;
  var container = null;
  var sidebar = null;
  var spinIsActive = false;

  function init(mapObj) {
    map = mapObj;
    container = document.getElementById(A2ta.config.map.containerID);
    addSpin(map);
    chargerGeoPoints();
    setControls(map);
    addSidebar(map);
    A2ta.config.map.defaultLat = map.options.center[0];
    A2ta.config.map.defaultLng = map.options.center[1];
    A2ta.config.map.defaultZoom = map.options.zoom;
    //
    A2ta.Map.Search.init();
  }

  function addSpin(mapObj) {
    var container = mapObj.getContainer();
    var overlay = L.DomUtil.create("div", "mp-SpinOverlay", container);
    overlay.id = "spinOverlay";
    L.DomUtil.addClass(overlay, "is-visible");
    spinIsActive = true;
    mapObj.spin(true);
  }

  function removeSpin(mapObj) {
    var overlay = L.DomUtil.get("spinOverlay");
    setTimeout(function () {
      L.DomUtil.removeClass(overlay, "is-visible");
      mapObj.spin(false);
      spinIsActive = false;
    }, 600);
    L.DomUtil.remove(overlay);
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
  }

  function setControls(mapObj) {
    // Le zoom est désactivé par défaut, car forcément positionné
    // en haut à gauche.
    L.control.zoom({ position: "bottomleft" }).addTo(mapObj);
    // Bouton A propos de la carte
    var infoBtn = L.easyButton({
      position: "bottomleft",
      states: [
        {
          icon: '<svg class="mp-Icon"><use href="#iconInfo" /></svg>',
          title: "À propos de cette carte",
          onClick: function (control) {
            $.get("spip.php?page=map-info", function (html) {
              sidebar.setContent(html);
              if (!sidebar.isVisible()) {
                sidebar.show();
              }
            });
          },
        },
      ],
    });
    // Bouton Ajouter une association à la carte
    var addOrgBtn = L.easyButton({
      position: "bottomleft",
      states: [
        {
          icon: '<svg class="mp-Icon"><use href="#iconGeoAdd" /></svg>',
          onClick: function (control) {
            $.get("spip.php?page=map-ajouter-association", function (html) {
              sidebar.setContent(html);
              if (!sidebar.isVisible()) {
                sidebar.show();
              }
            });
          },
        },
      ],
    });

    infoBtn.addTo(mapObj);
    addOrgBtn.addTo(mapObj);
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
      $.getJSON(url).done(function (json) {
        parseJson(json, true);
      });
    }
  }

  /**
   * Afficher les points de géolocalisation
   *
   * Fonction dérivée de la fonction parseGeoJson
   * dans l'API de GIS.
   */
  function parseJson(json, reset) {
    var defaultView = reset;

    if (!map.options.cluster) {
      if (json.features && json.features.length > 0) {
        var geoJson = L.geoJson("", {
          style: map.options.pathStyles
            ? map.options.pathStyles
            : function (feature) {
                if (feature.properties && feature.properties.styles) {
                  return feature.properties.styles;
                } else {
                  return "";
                }
              },
          onEachFeature: function (feature, layer) {
            if (feature.geometry.type == "Point") {
              map.setGeoJsonFeatureIcon(feature, layer);
            }
            // map.setGeoJsonFeaturePopup(feature, layer);
          },
          pointToLayer: function (feature, latlng) {
            var alt = "Marker";
            if (feature.properties.title) {
              alt = feature.properties.title;
            }
            var marker = L.marker(latlng, { alt: alt });
            marker.on("click", handleClickOnMarker);
            return marker;
          },
        })
          .addData(json)
          .addTo(map);

        // Note : Les options centre de GIS ne sont pas prises en compte
        // et gérer uniquement en fonction du boolean reset.
        // if (map.options.autocenterandzoom) {
        //   map.centerAndZoom(geoJson.getBounds());
        // }

        if (!reset) {
          var bound = geoJson.getBounds();
          var bounds = new L.LatLngBounds();
          bounds.extend(bound);
          var options = map.options;

          if (
            bounds._northEast.lat == bounds._southWest.lat &&
            bounds._northEast.lng == bounds._southWest.lng
          ) {
            var singlePoint = true;
            options.maxZoom = 16;
            bounds._northEast.lat += 0.1;
            bounds._northEast.lng += 0.1;
            bounds._southWest.lat -= 0.1;
            bounds._southWest.lng -= 0.1;
          }

          map.fitBounds(bounds, options);
          map.setZoom(options.maxZoom);
        } else {
          map.setView(
            [A2ta.config.map.defaultLat, A2ta.config.map.defaultLng],
            A2ta.config.map.defaultZoom
          );
        }

        if (map.options.openId) {
          gis_focus_marker(map.options.openId, map.options.mapId);
        }

        if (typeof map.geojsons == "undefined") {
          map.geojsons = [];
        }

        map.geojsons.push(geoJson);

        if (spinIsActive) {
          removeSpin(map);
        }
      }
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
      if (spinIsActive) {
        removeSpin(map);
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
    if (member == 1) {
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

    console.log(links);

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
        if (links[link] !== "") {
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

  return {
    init: init,
    chargerGeoPoints: chargerGeoPoints,
    getMapContainer: function () {
      return container;
    },
  };
})();
