JSONEditor.defaults.options["theme"] = "bootstrap3";
JSONEditor.defaults.options["iconlib"] = "bootstrap3";
JSONEditor.defaults.options["object_layout"] = "grid";
JSONEditor.defaults.options["template"] = "default";
JSONEditor.defaults.options["show_errors"] = "interaction";
JSONEditor.defaults.options["required_by_default"] = 1;
JSONEditor.defaults.options["no_additional_properties"] = 0;
JSONEditor.defaults.options["display_required_only"] = 0;
JSONEditor.defaults.options["remove_empty_properties"] = 0;
JSONEditor.defaults.options["keep_oneof_values"] = 1;
JSONEditor.defaults.options["ajax"] = 0;
JSONEditor.defaults.options["ajaxCredentials"] = 0;
JSONEditor.defaults.options["show_opt_in"] = 0;
JSONEditor.defaults.options["disable_edit_json"] = 1;
JSONEditor.defaults.options["disable_collapse"] = 0;
JSONEditor.defaults.options["disable_properties"] = 1;
JSONEditor.defaults.options["disable_array_add"] = 0;
JSONEditor.defaults.options["disable_array_reorder"] = 1;
JSONEditor.defaults.options["disable_array_delete"] = 0;
JSONEditor.defaults.options["enable_array_copy"] = 1;
JSONEditor.defaults.options["array_controls_top"] = 0;
JSONEditor.defaults.options["disable_array_delete_all_rows"] = 0;
JSONEditor.defaults.options["disable_array_delete_last_row"] = 0;
JSONEditor.defaults.options["prompt_before_delete"] = 1;
var jseditor, jedata = {
	schema: {
		"$schema": "http://json-schema.org/draft-04/schema#",
		"type": "object",
		"title": "Admin",
		"options": {
			"disable_collapse": true
		},
		"properties": {
			"name": {
				"type": "string",
				"title": "Site name"
			},
			"zoomRatio": {
				"type": "integer",
				"default": 100,
				"minimum": 0,
				"maximum": 200,
				"title": "Zoom ratio"
			},
			"palettes": {
				"type": "array",
				"title": "Color palettes",
				"items": {
					"type": "object",
					"title": "Palette",
					"properties": {
						"key": {
							"type": "string",
							"title": "Unique key"
						},
						"name": {
							"type": "string",
							"title": "Name"
						},
						"color": {
							"type": "string",
							"format": "color",
							"title": "Color"
						}
					},
					"required": [
						"key",
						"name",
						"color"
					]
				}
			},
			"buildings": {
				"type": "array",
				"title": "Lots",
				"items": {
					"type": "object",
					"title": "Lot",
					"properties": {
						"name": {
							"type": "string",
							"title": "Name"
						},
						"src": {
							"type": "string",
							"title": "Src"
						},
						"url": {
							"type": "string",
							"title": "Url"
						},
						"elevation": {
							"type": "string",
							"title": "Elevation"
						},
						"price": {
							"type": "string",
							"title": "Price"
						},
						"uid": {
							"type": "string",
							"title": "Lot ID"
						},
						"selector": {
							"type": "string",
							"title": "Selector"
						},
						"state": {
							"type": "string",
							"title": "State"
						},
						"type": {
							"type": "string",
							"title": "Type"
						},
						"sq": {
							"type": "string",
							"title": "SQ"
						},
						"bedrooms": {
							"type": "string",
							"title": "Bedrooms"
						},
						"bathrooms": {
							"type": "string",
							"title": "Bathrooms"
						}
					},
					"required": [
						"name",
						"src",
						"url",
						"elevation",
						"price",
						"uid",
						"selector",
						"state",
						"type",
						"sq",
						"bedrooms",
						"bathrooms"
					]
				}
			}
		},
		"required": [
			"name",
			"zoomRatio",
			"palettes",
			"buildings"
		]
	}, startval: null
};// The following lines are mandatory and readonly. You can add custom code above and below.
if (jseditor instanceof window.JSONEditor) jseditor.destroy();
jseditor = new window.JSONEditor(document.querySelector("#json-editor-form"), jedata);

jseditor.on('ready', function () {
	var $save = jseditor.root.getButton('Save', '', 'Save'),
		$upload = jseditor.root.getButton('Upload', '', 'Upload'),
		$uploadPlan = document.getElementById('upload-plan'),
		button_holder = jseditor.root.theme.getHeaderButtonHolder();
	button_holder.appendChild($upload);
	button_holder.appendChild($save);
	jseditor.root.header.parentNode.insertBefore(button_holder, jseditor.root.header.nextSibling);

	$save.addEventListener('click', function (e) {
		e.preventDefault();
		var example = jseditor.getValue(),
			filename = 'plan.json',
			blob = new Blob([JSON.stringify(example, null, 2)], {
				type: "application/json;charset=utf-8"
			});

		var a = document.createElement('a');
		a.download = filename;
		a.href = URL.createObjectURL(blob);
		a.dataset.downloadurl = ['text/plain', a.download, a.href].join(':');
		//anchor.click();
		a.dispatchEvent(new MouseEvent('click', {
			'view': window,
			'bubbles': true,
			'cancelable': false
		}));

	}, false);
	$uploadPlan.onchange = ({ target }) => {
		const [file] = target.files;
		const reader = new FileReader();
		reader.onload = e => {
			$uploadPlan.value = '';
			try {
				const json = JSON.parse(e.target.result);
				jseditor.setValue(json);
				const errors = jseditor.validate();
				if (errors.length) {
					console.log(errors);
				}
			}
			catch (error) {
				alert(error)
			}
		};
		reader.readAsText(file);
	};
	$upload.onclick = () => $uploadPlan.click();
});
