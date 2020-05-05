A2ta.Map.Search = A2ta.Map.Search || {};

A2ta.Map.Search = (function () {
  var labels = null,
    mapContainer = null,
    keywordLabels = [],
    keywordValues = [];

  function init() {
    var mapContainer = A2ta.Map.getMapContainer();
    if (mapContainer) {
      var searchForm = mapContainer.querySelector(
        "#" + A2ta.config.search.searchFormID
      );
      setupSearchInputs(searchForm);
      setupNoResultMessage();
    }
  }

  function setupSearchInputs(searchContainer) {
    labels = searchContainer.querySelectorAll(
      "." + A2ta.config.search.labelClass
    );

    var inputs = searchContainer.querySelectorAll("input[type=text]");

    labels.forEach(function (label) {
      label.classList.add("js-FormLabel");
    });

    inputs.forEach(function (input, index) {
      // Focus event
      input.addEventListener(
        "focus",
        function (event) {
          handleEventInput(event, index);
        },
        false
      );
      // Blur event
      input.addEventListener(
        "blur",
        function (event) {
          handleEventInput(event, index);
        },
        false
      );
    });
  }

  function handleEventInput(event, index) {
    if ("focus" == event.type) {
      labels[index].classList.add("is-Focused");
    }

    if ("blur" == event.type && "" == event.target.value) {
      labels[index].classList.remove("is-Focused");
    }
  }

  function selecteurFulltext(event, ui) {
    var keywordLabel = ui.item.label;
    var keywordValue = ui.item.value;
    var alreadyExists = keywordValues.indexOf(keywordValue);

    if (alreadyExists == -1) {
      keywordLabels.push(keywordLabel);
      keywordValues.push(keywordValue);
      // Index du mot dans le tableau
      var index = keywordLabels.length - 1;
      // Afficher le mot-clé
      var keyword = setKeyword(keywordLabel, keywordValue);
      addKeyword(keyword, index);
    }

    this.value = "";
    return false;
  }

  function setupNoResultMessage() {
    // Récupérer tous les éléments avec une instance ui-autocomplete
    var autocompleteEls = $(":data('ui-autocomplete')");
    // Pour chacun de ces éléments, afficher un message
    // pour une recherche sans résultat.
    $.each(autocompleteEls, function (index, element) {
      $(element).on("autocompleteresponse", function (event, ui) {
        var parent = this.parentNode;
        var childMessage = parent.querySelector(
          "." + A2ta.config.search.messageClass
        );

        if (!ui.content.length && !childMessage) {
          var inputVal = this.value;
          if (inputVal) {
            var message = getNoResultMessage(inputVal);
            parent.appendChild(message);
          }
        } else if (ui.content.length && childMessage) {
          parent.removeChild(childMessage);
        }
      });
    });
  }

  function getNoResultMessage(inputValue) {
    var messageText = "";
    if (inputValue) {
      messageText = `Aucun résultat pour « ${inputValue} »`;
    } else {
      messageText = `Aucun résultat`;
    }
    var message = document.createElement("div");
    message.className = A2ta.config.search.messageClass;

    var span = document.createElement("span");
    span.className = A2ta.config.search.messageLabelClass;
    span.appendChild(document.createTextNode(messageText));
    message.appendChild(span);

    if (inputValue) {
      var button = document.createElement("button");
      button.className = A2ta.config.search.messageDeleteClass;
      button.addEventListener("click", handleEventNoResultMessage, false);
      message.appendChild(button);
    }

    return message;
  }

  function handleEventNoResultMessage(event) {
    var messageContainer = this.offsetParent;
    var parent = messageContainer.offsetParent;
    parent.removeChild(messageContainer);
  }

  function setKeyword(label, value) {
    var listItem = document.createElement("li");
    listItem.className = A2ta.config.keywords.listItemClass;

    var span = document.createElement("span");
    span.className = A2ta.config.keywords.labelClass;
    span.appendChild(document.createTextNode(label));

    var button = document.createElement("button");
    button.className = A2ta.config.keywords.buttonClass;
    button.id = A2ta.config.keywords.buttonID;
    button.dataset.value = value;
    button.addEventListener("click", removeKeyword, false);

    listItem.appendChild(span);
    listItem.appendChild(button);

    return listItem;
  }

  function addKeyword(keyword, index) {
    var keywordsContainer = document.querySelector(
      "#" + A2ta.config.keywords.containerID
    );
    // Vérifier si une liste existe déjà
    var list = keywordsContainer.firstChild;
    if (!list) {
      // Si ce n'est pas le cas, créer la liste.
      list = document.createElement("ul");
      list.className = A2ta.config.keywords.listClass;
    }
    list.appendChild(keyword);
    //Afficher la liste
    keywordsContainer.appendChild(list);

    // Vérifier si la liste ne contient pas le message "Aucun résultat"
    var messageClass = A2ta.config.search.messageClass.split(" ");
    var messageNoResult = keywordsContainer.querySelector(
      "." + messageClass[0]
    );
    if (messageNoResult) {
      keywordsContainer.removeChild(messageNoResult);
    }
    // Recharger la carte en fonction des critères.
    A2ta.Map.chargerGeoPoints(keywordValues);
  }

  function removeKeyword(event) {
    var value = this.dataset.value;
    var parent = this.offsetParent;
    var index = keywordValues.indexOf(value);
    if (value !== -1) {
      // Supprimer les mots-clés des tableaux qui servent de référence
      // et de la liste affichée à l'utilisateur.
      keywordLabels.splice(index, 1);
      keywordValues.splice(index, 1);
      parent.removeChild(parent.childNodes[index]);

      // Vérifier si la liste ne contient pas le message "Aucun résultat"
      var messageClass = A2ta.config.search.messageClass.split(" ");
      var messageNoResult = parent.parentNode.querySelector(
        "." + messageClass[0]
      );
      console.log(messageClass, messageNoResult);
      if (messageNoResult) {
        parent.parentNode.removeChild(messageNoResult);
      }

      // Recharger la carte
      A2ta.Map.chargerGeoPoints(keywordValues);
    }
  }

  return {
    init: init,
    selecteurFulltext: selecteurFulltext,
    getNoResultMessage: getNoResultMessage,
  };
})();
