// étendre le widget Autocomplete
$.widget("ui.autocomplete", $.ui.autocomplete, {
	options: {
		delay: 500,
		prefix: "",
		position: {
			of: "#listAutocompleteResponse",
		},
	},

	_renderItem: function (ul, item) {
		var label = item.label;
		if (this.options.prefix) {
			label = this.options.prefix + " " + label;
		}
		return $("<li>").append($("<a>").text(label)).appendTo(ul);
	},
});
