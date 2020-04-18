var A2taMap={jqCarte:{},objCarte:{},self:{},init:function(mapObject){self=this;self.objCarte=mapObject;self.getJqCarte(self.objCarte);self.jqCarte.on("ready",(function(){self.setZoomControl()}))},getJqCarte:function(mapObject){var id=mapObject.options.mapId,m=$("#map"+id);return self.jqCarte=m},setZoomControl:function(){self.objCarte.zoomControl.setPosition("bottomleft")},parseJson:function(json){var map=self.objCarte;var markers=[];map.markerCluster=L.markerClusterGroup(map.options.clusterOptions).addTo(map);$.each(json.features,(function(i,feature){if(feature.geometry.type==="Point"&&feature.geometry.coordinates[0]){var marker=L.marker([feature.geometry.coordinates[1],feature.geometry.coordinates[0]]);map.setGeoJsonFeatureIcon(feature,marker);map.setGeoJsonFeaturePopup(feature,marker);marker.feature=feature;marker.id=feature.id;markers.push(marker)}}));map.markerCluster.addLayers(markers);var bounds=map.markerCluster.getBounds();map.fitBounds(bounds)}};var tabCriteresSearch=[],tabCriteresHidden=[],tabPoints=[];function rechercheLibreCb(event,ui){var critereValue=ui.item.value,critereLabel=ui.item.label,hiddenInput=$("input[name='criteres_recherche_libre']"),hiddenInputValue=hiddenInput.val(),dejaPresent=tabCriteresSearch.indexOf(critereLabel);if(""!==hiddenInputValue){hiddenInputValue=JSON.parse(hiddenInputValue)}if(dejaPresent==-1){tabCriteresSearch.push(critereLabel);tabCriteresHidden.push(critereValue);afficherCriteres()}var str=JSON.stringify(tabCriteresHidden);hiddenInput.val(str);this.value="";return false}$((function(){var acInput=$("#input-carte-recherche-libre"),acContainer=$("#listAutocomplete");if(acContainer.length){var width=acInput.outerWidth();acContainer.css("width",width+"px")}if(acInput.length){acInput.on("autocompleteresponse",(function(event,ui){if(!ui.content.length){var inputVal=this.value;if(inputVal){var message=getMessageInfoNoResult(inputVal);acContainer.html(message);$(this).on("blur",annulerInfoNoResult);$(this).off("blur",annulerInfoNoResult)}}else{annulerInfoNoResult()}}))}}));function annulerInfoNoResult(){$("#infoNoResult").css("display","none")}function getMessageInfoNoResult(val){var message="",messageT="";if(val){messageT="Aucun résultat pour « "+val+" »"}else{messageT="Aucun résultat"}message='<div id="infoNoResult" class="c-message c-message--info">';message+=messageT;message+="</div>";return message}function afficherCriteres(){var listCriteres='<ul class="o-list-bare c-carte__criteres">',container=$("#listCriteres");for(var i=0;i<tabCriteresSearch.length;i++){listCriteres+='<li class="o-liste-bare__item c-carte__critere">'+'<span class="c-carte__critere-label">'+tabCriteresSearch[i]+"</span>"+'<button id="critereDelete'+i+'" class="c-btn c-carte__critere-btn"></button></li>'}listCriteres+="</ul>";container.html(listCriteres);chargerPoints()}function chargerPoints(){A2taMap.objCarte.removeAllMarkers();var tabPoints=[],parametres={id_association:[],id_mot:[],ville:[],limit:500};for(var i=0;i<tabCriteresHidden.length;i++){var p=tabCriteresHidden[i].split(":");for(var property in parametres){var k=p[0],l=parametres[k].length;if(property===k){parametres[k][l]=p[1]}}}var query=$.param(parametres);$.getJSON("http.api/collectionjson/associations"+"?"+query).done((function(json){associationsList={id_association:[]};$.each(json.collection.items,(function(key,item){associationsList.id_association[key]=item.data[0].value}));var query=$.param(associationsList);$.getJSON("?page=gis_json&objets=associations_env&limit=500&"+query).done((function(json){A2taMap.parseJson(json)}))})).fail((function(jqxhr,textStatus,error){var container=$("#listCriteres"),message=getMessageInfoNoResult();container.append(message)}))}$.widget("ui.autocomplete",$.ui.autocomplete,{options:{delay:500,prefix:"",position:{of:"#listAutocomplete"}},_renderItem:function(ul,item){var label=item.label;if(this.options.prefix){label=this.options.prefix+" "+label}return $("<li>").append($("<a>").text(label)).appendTo(ul)}});