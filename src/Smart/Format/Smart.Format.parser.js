(function() {
	Smart.format = function(template, data) {
		return Smart.Format.parse(template)(data);
	};
	Smart.Format.parse = parse;
	
	function parse(templateString) {
				
		// template = literal { selector [: template : template ...]} literal
		
		function template() {
			var r = read(literal, repeat(placeholder, literal));
			
			var template = r[0] ? [ r[0] ] : [];
			r[1].forEach(function(placeholderAndLiteral) {
				template.push(placeholderAndLiteral[0]);
				if (placeholderAndLiteral[1])
					template.push(placeholderAndLiteral[1]);
			});
			return template;
		}
		function templateNoColon() {
			var r = read(literalNoColon, repeat(placeholder, literalNoColon));
			
			var template = r[0] ? [ r[0] ] : [];
			r[1].forEach(function(placeholderAndLiteral) {
				template.push(placeholderAndLiteral[0]);
				if (placeholderAndLiteral[1])
					template.push(placeholderAndLiteral[1]);
			});
			return template;
		}
		function literal() {
			var notBrace = not('{', '}');
			var r = read(notBrace);
			return r[0];
		}
		function literalNoColon() {
			var notBraceColon = not('{', '}', ':');
			var r = read(notBraceColon);
			return r[0];
		}
		
		
		function placeholder() {
			var r = read('{', selector, repeat(':', templateNoColon), '}');
			if (r === null) return null;
			var placeholder = {
				selector: r[1],
				formats: r[2].map(function(colonTemplate) { return colonTemplate[1]; })
			};
			return placeholder;
		}
		function selector() {
			var r = read(not(':', '}'));
			return r[0];
		}


		var templateIndex = 0, templateLength = templateString.length;
		function repeat(patterns_) {
			var patterns = arguments;
			return function pattern_for_repeat() {
				var results = [];
				while (true) {
					var r = read.apply(null, patterns);
					if (r === null) break;
					results.push(r);
				}
				return results;
			};
		}
		function not(chars_) {
			var chars = arguments, indexOf = Array.prototype.indexOf;
			var isNotAllowed = function(c) {
				return indexOf.call(chars, c) !== -1;
			};
			return function pattern_for_not() {
				var startIndex = templateIndex;
				while (templateIndex < templateLength) {
					var c = templateString.charAt(templateIndex);
					if (isNotAllowed(c)) {
						break;
					}
					templateIndex++;
				}
				return templateString.substring(startIndex, templateIndex);
			};
		}
		function read(patterns_) {
			var patterns = arguments;
			var restoreIndex = templateIndex;
			var results = new Array(patterns.length);
			for (var i = 0, l = patterns.length; i < l; i++) {
				var pattern = patterns[i], result = null;
				if (typeof pattern === "function") {
					result = pattern();
				} else {
					var patternStringIsAMatch = (pattern.length === 1 && pattern === templateString.charAt(templateIndex))
						|| (pattern === templateString.substr(templateIndex, pattern.length));
					if (patternStringIsAMatch) {
						result = pattern;
						templateIndex += pattern.length;
					}
				}
				if (result === null) {
					templateIndex = restoreIndex;
					return null;
				}
				results[i] = result;
			}
			return results;
		}
		
		return template();
	}
	
})();
