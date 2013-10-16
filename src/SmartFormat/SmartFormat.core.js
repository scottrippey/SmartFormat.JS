(function(global){

	var SmartFormat = SimpleClass(function SmartFormat(formatters_) {
		this._formatters = Array.prototype.slice.call(arguments);
	}, {
		format: function(template, data) {
			var parsed = this._parseTemplate(template);
			return this._formatParsed(parsed, data);
		}

		, parse: function(template) {
			var parsed = this._parseTemplate(template);
			return function(data) {
				return this._formatParsed(parsed, data);
			};
		}
		, _parseTemplate: function(template) {
			var root = []
				, stack = []
				, literalStart = null
				, selectorStart = null
				, format = root
				;

			for (var i = 0, l = template.length; i < l; i++) {
				var c = template.charAt(i);
				if (selectorStart !== null) {
					var placeholder;
					if (c === ':' || c === '}') {
						placeholder = { selector: template.substring(selectorStart, i) };
						selectorStart = null;
						format.push(placeholder);

						if (c === ':') {
							stack.push(format);
							format = placeholder.format = [];
						}
					}
				} else {
					if (c === '\\' || c === '{' || c === '}') {
						if (literalStart !== null) {
							format.push(template.substring(literalStart, i));
							literalStart = null;
						}
					}

					if (c === '{') {
						selectorStart = i+1;
					} else if (c === '}' && stack.length) {
						format = stack.pop();
					} else {
						if (c === '\\') i++;
						if (literalStart === null)
							literalStart = i;
					}
				}
			}
			if (literalStart !== null) {
				format.push(template.substring(literalStart, i));
			}

			return root;
		}

		, addFormatters: function(formatters_) {
			for (var i = 0, l = arguments.length; i < l; i++) {
				var formatter = arguments[i];
				if (typeof formatter === 'string') {
					formatter = SmartFormat._definedFormatters[formatter];
				}
				if (formatter == null) throw new Error();

				this._formatters.push(formatter);
			}
		}
		, _formatParsed: function(format, data) {
			var output = "";
			for (var i = 0, l = format.length; i < l; i++) {
				var node = format[i];
				var isPlaceholder = (typeof node === 'object');
				if (isPlaceholder) {
					// Placeholder:
					var value = this._evaluateSelector(node.selector, data);
					output += this._evaluateFormat(value, node.format);
				} else {
					// Literal:
					output += node;
				}
			}
			return output;
		}
		, _evaluateSelector: function(selector, data) {
			var value = data;
			var splits = selector.split('.');
			for (var i = 0, l = splits.length; i < l && value != null; i++) {
				if (splits[i] === "") continue;
				value = value[splits[i++]];
			}
			return value;
		}
		, _evaluateFormat: function(value, format) {
			if (format == undefined) {
				return value;
			}


			var hasPlaceholder = false;
			for (var i = 0, l = format.length; i < l; i++) {
				hasPlaceholder = (typeof format[i] === 'object');
				if (hasPlaceholder) break;
			}
			var formatInfo = {
				smartFormat: this
				, hasPlaceholder: hasPlaceholder
			};

			var result;
			for (var i = 0, l = this._formatters.length; i < l; i++) {
				var formatter = this._formatters[i];
				result = formatter(value, format, formatInfo);
				if (result !== undefined)
					return result;
			}

			// None of the formatters were successful.
			return value;
		}
	});
	extend(SmartFormat, {
		_definedFormatters: {}
		,
		defineFormatters: function(formatters) {
			extend(this._definedFormatters, formatters);
		}
	});

	function SimpleClass(constructor, methods) {
		extend(constructor.prototype, methods);
		return constructor;
	}
	function extend(target, source) {
		for (var method in source) {
			if (!source.hasOwnProperty(method)) continue;
			target[method] = source[method];
		}
		return target;
	}





	var Smart = new SmartFormat();
	global.Smart = Smart;
	global.Smart.SmartFormat = SmartFormat;





})(this);
