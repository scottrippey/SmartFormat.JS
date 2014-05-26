(function init_PatternFactory() {
	var PatternFactory = {
		normalize: function(pattern) {
			switch (typeof pattern) {
				case 'string':
					if (pattern.length === 1) {
						return function matchSingleChar(currentParse) {
							var currentChar = currentParse.templateString.charAt(currentParse.templateIndex);
							if (pattern === currentChar) {
								currentParse.templateIndex++;
								return pattern;
							}
							return null;
						};
					} else {
						var l = pattern.length;
						return function matchFullString(currentParse) {
							var templateString = currentParse.templateString, templateIndex = currentParse.templateIndex;
							for (var i = 0; i < l; i++) {
								var patternChar = pattern.charAt(i), templateChar = templateString.charAt(templateIndex + i);
								if (patternChar !== templateChar)
									return null;
							}
							currentParse.templateIndex += pattern.length;
							return pattern;
						};
					}
					break;
				case 'function':
					return pattern;
					break;
				default:
					throw new Error("Unknown pattern type; " + pattern);
			}
		}
		,pattern: function (patterns_) {
			var patterns = Array.prototype.map.call(arguments, this.normalize);
			return function patternFactory_pattern(currentParse) {
				var restoreIndex = currentParse.templateIndex;
				
				var results = new Array(patterns.length);
				for (var i = 0, l = patterns.length; i < l; i++) {
					var result = patterns[i](currentParse);
					if (result === null) break;
					results[i] = result;
				}
				if (i === l) {
					return results;
				}
				
				currentParse.templateIndex = restoreIndex;
				return null;
			};
		}
		,repeat: function (patterns_) {
			var patterns = this.pattern.apply(this, arguments);
			return function patternFactory_repeat(currentParse) {
				var results = [];
				while (true) {
					var result = patterns(currentParse);
					if (!result) break;
					results.push(result);
				}
				return results;
			};
		}
		,any: function (patterns_) {
			var patterns = Array.prototype.map.call(arguments, this.normalize);
			var l = patterns.length;
			return function patternFactory_any(currentParse) {
				for (var i = 0; i < l; i++) {
					var result = patterns[i](currentParse);
					if (result) return result;
				}
				return null;
			};
		}
		,until: function (patterns_) {
			var pattern = this.any.apply(this, arguments);
			return function patternFactory_until(currentParse) {
				while (true) {
					var result = pattern(currentParse);
					if (result) return result;
					currentParse.templateIndex++;
				}
			};
		}
		,optional: function (patterns_) {
			var pattern = this.pattern.apply(this, arguments);
			return function patternFactory_optional(currentParse) {
				var restoreIndex = currentParse.templateIndex;
				var result = pattern(currentParse);
				if (!result) {
					currentParse.templateIndex = restoreIndex;
				}
				return result;
			};
		}
	};
	Smart.Format.PatternFactory = PatternFactory;
})();
(function init_Parser() {
	
	var PatternFactory = Smart.Format.PatternFactory;
	
	function Parser() {}
	Parser.prototype = {
		template: function (template) {
			if (!this._template) {
				this._template = PatternFactory.repeat(this.literal, this.placeholder);
			}
			var repeats = this._template(template);

			var items = [];
			repeats.forEach(function (literalPlaceholder) {
				if (literalPlaceholder[0]) items.push(literalPlaceholder[0]);
				items.push(literalPlaceholder[1]);
			});
			return items;
		}
		,literal: function (template) {
			if (!this._literal) {
				this._literal = PatternFactory.until('{');
			}
			return this._literal(template);
		}
		,placeholder: function (template) {
			if (!this._placeholder) {
				this._placeholder = PatternFactory.pattern('{', this.selector, PatternFactory.optional(':', this.template), '}');
			}
			return this._placeholder(template, function (openBrace, selector, colonTemplate, closeBrace) {
				return { selector: selector, format: colonTemplate[1] || [] };
			});
		}
		,selector: function (template) {
			if (!this._selector) {
				this._selector = PatternFactory.until(':', '}');
			}
			return this._selector(template);
		}
	};

	Smart.Format.Parser = Parser;
})();
(function init_Formatter() {

	function Formatter(parser) {
		this.initialize(parser);
	}
	Formatter.prototype = {
		initialize: function(parser) {
			this.parser = parser || new Smart.Format.Parser();
			this.formatters = {};
		}
		,format: function(templateString, data) {
			var template = { templateString: templateString, templateIndex: 0 };
			var templateTree = this.parser.template(template);
			if (data === undefined) {
				return function (data) {
					return Formatter.formatTree(templateTree, data);
				};
			} else {
				return Formatter.formatTree(templateTree, data);
			}
		}
		,formatTree: function(templateTree, data) {
			var formatContext = {
				output: [], scopeStack: [ data ]
			};
			
			this.outputTemplate(templateTree, formatContext);
			
			return formatContext.output.join("");
		}
		,outputTemplate: function(templateTree, formatContext) {
			for (var i = 0, l = templateTree.length; i < l; i++) {
				var item = templateTree[i];
				// Could be a selector or a literal:
				if (typeof item === 'string') {
					this.outputLiteral(item, formatContext);
				} else {
					this.outputPlaceholder(item, formatContext);
				}
			}
		}
		,outputLiteral: function(literal, formatContext) {
			formatContext.output.push(literal);			
		}
		,outputPlaceholder: function(placeholder, formatContext) {
			var nestedData = this.evaluateSelector(placeholder, formatContext);

			var formatTemplateTree = placeholder.formats;
			formatContext.scopeStack.push(nestedData);
			this.outputFormat(formatTemplateTree, formatContext);
			formatContext.scopeStack.pop();
		}
		,evaluateSelector: function(placeholder, formatContext) {
			var selectorFn = placeholder.selectorFn;
			if (!selectorFn) {
				var selector = placeholder.selector;
				selectorFn = new Function('scopeStack', ' with (scopeStack[0]) { return ' + selector + "; } ");
				placeholder.selectorFn = selectorFn;
			}
			var result = selectorFn(formatContext.scopeStack);
			return result;
		}
		,outputFormat: function(formatTemplateTree, formatContext) {
			var formatters = this.formatters;
			for (var formatterName in formatters) {
				if (!formatters.hasOwnProperty(formatterName)) continue;
				var formatter = formatters[formatterName];
				var result = formatter(formatTemplateTree, formatContext);
				if (result === true)
					break;
			}
		}
	};
	
	// Expose everything:
	Smart.Format.Formatter = Formatter;
	
	// Defaults:
	Smart.Format.defaultFormatter = new Formatter();
	Smart.format = Smart.Format.format = function(templateString, data) {
		Smart.Format.defaultFormatter.format(templateString, data);
	};
	
})();
