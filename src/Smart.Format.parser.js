(function() {
	var tests = [
		" LITERAL { SELECTOR 1 } MORE LITERAL "	
		," LITERAL { SELECTOR 1 } MIDDLE LITERAL { SELECTOR 2 } MORE LITERAL "	
		," LITERAL { SELECTOR : LITERAL } MORE LITERAL "	
		," LITERAL { SELECTOR : FORMATTER : LITERAL } MORE LITERAL "	
		," LITERAL { SELECTOR : FORMATTER : PARAM 1 : LITERAL } MORE LITERAL "	
		," LITERAL { SELECTOR : FORMATTER : PARAM 1 : PARAM 2 : LITERAL } MORE LITERAL "	
		," LITERAL { SELECTOR : FORMATTER : PARAM 1 : PARAM 2 { } : { NESTED.SELECTOR : NESTED TEMPLATE } : LITERAL } MORE LITERAL "	
	];
	tests.forEach(function(test) {
		var result = parse(test);
		console.log(test, JSON.stringify(result, null, '  '));
	});
	
	
	function parse(templateString) {
		
		var templateIndex = 0, templateLength = templateString.length;
		
		// template = literal { selector [: template : template ...]} literal
		
		function template() {
			var r = find(literal, repeat(placeholder, literal));
			return r[1].reduce(function(result, placeholderAndLiteral) { 
				result.push(placeholderAndLiteral[0], placeholderAndLiteral[1]); 
				return result;
			}, [ r[0] ]);
		}
		function templateNoColon() {
			var r = find(literalNoColon, repeat(placeholder, literalNoColon));
			return r[1].reduce(function(result, placeholderAndLiteral) {
				result.push(placeholderAndLiteral[0], placeholderAndLiteral[1]);
				return result;
			}, [ r[0] ]);
		}
		function literal() {
			var notBrace = not('{', '}');
			var r = find(notBrace);
			if (r === null) return "";
			return r[0];
		}
		function literalNoColon() {
			var notBrace = not('{', '}', ':');
			var r = find(notBrace);
			if (r === null) return "";
			return r[0];
		}
		
		
		function placeholder() {
			var r = find('{', selector, repeat(':', templateNoColon), '}');
			if (r === null) return null;
			var placeholder = {
				selector: r[1],
				formats: r[2].reduce(function(results, colonTemplate) {
					results.push(colonTemplate[1]);
					return results;
				}, [])
			};
			return placeholder;
		}
		function selector() {
			var r = find(not(':', '}'));
			return r[0];
		}
		

		function repeat(patterns_) {
			var patterns = arguments;
			return function pattern_for_repeat() {
				var results = [];
				while (true) {
					var r = find.apply(null, patterns);
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
		function find(patterns_) {
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
