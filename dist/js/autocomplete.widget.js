// Extension du widget autocomplete, chargée dans head_js
// afin qu'il soit chargé après l'extension mise en œuvre
// par le plugin Sélecteur générique.

$.widget("ui.autocomplete", $.ui.autocomplete, {
  options: {
    delay: 500,
    prefix: "",
    classes: {
      "ui-autocomplete": "mp-Form_AutocompleteMenu",
    },
  },

  _renderItem: function (ul, item) {
    var label = item.label;
    var value = item.value.split(":");
    var li_class = "mp-Form_AutocompleteMenuItem";

    if (value[0] === "ville") {
      li_class += " mp-Form_AutocompleteMenuItem-Geo";
    } else if (value[0] === "id_mot") {
      li_class += " mp-Form_AutocompleteMenuItem-Activity";
    } else if (value[0] === "id_association") {
      li_class += " mp-Form_AutocompleteMenuItem-Org";
    }

    // if (this.options.prefix) {
    //   label = this.options.prefix + " " + label;
    // }
    return $("<li>")
      .addClass(li_class)
      .append($("<a>").addClass("mp-Form_AutocompleteMenuLink").text(label))
      .appendTo(ul);
  },

  _resizeMenu: function () {
    var ul = this.menu.element;
    ul.outerWidth(this.element.outerWidth());
  },
});
