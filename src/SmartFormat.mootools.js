String.implement({
	/**
	 * Overrides MooTools' method.
	 *
	 * Uses SmartFormat to format the template.
	 * SmartFormat is fully backwards-compatible with substitute, and adds extra formatting features.
	 */
	substitute: function(object){
		return Smart.format(this, object);
	}
});

/**
 * Extend SmartFormat with MooTools formatting for plurals, Date, Number, and anything with a `format` function:
 */
Smart.addExtensions('formatter', {
	conditionalFormatter: function(value, format) {
		if (format) {
			var params = format.split('|');
			if (params.length >= 2) {
				switch (typeOf(value)) {
					case 'date':
						return (value <= new Date()) ? params[0] : params[1];
					case 'number':
						return (value < params.length) ? params[value] : null;
					case 'array':
						return (value.length) ? params[0] : params[1];
					default:
						return (value ? params[0] : params[1]);
				}
			}
		}
	}
	,
	listFormatter: function(values, format) {
		if (typeOf(values) === 'array') {
			var params = (format && format.split('|')) || [ "", ", " ];
			if (params.length >= 2) {
				var options = {
					format: params[0]
					,join: params[1]
					,last: params[2]
				};

				if (options.last) {
					if (values.length === 2) {
						return values.join(options.last);
					}
					values = Array.clone(values).splice(values.length - 2, 0, options.last);
				}
				return values.join(options.join);
			}
		}
	}
	,
	dateFormatter: function(value, format) {
		if (typeOf(value) === 'date') {
			format = format || "long";

			return value.format(format);
		}
	}
	,
	numberFormatter: function(value, format) {
		if (typeOf(value) === 'number' && format) {
			if (format.charAt(0) === 'C') {
				return value.formatCurrency(format.substr(1).toInt());
			} else if (format.charAt(0) === 'P') {
				return value.formatPercentage(format.substr(1).toInt());
			}
			var options = {};
			if (format.charAt(0) === 'N') {
				options.decimals = format.substr(1).toInt();
			}
			return value.format(options);
		}
	}
	,
	formatFormatter: function(value, format) {
		if (value !== undefined && value !== null) {
			if (typeOf(value.format) === 'function') {
				return value.format(format);
			}
		}
	}

});



(function() {

	Smart.addExtensions('formatter', {
		/**
		 * Chooses one of the options, based on a number and the current Locale plural rules.
		 */
		pluralFormatter: function(value, format) {
			if (format && typeOf(value) === 'number') {
				var params = format.split('|');
				if (params.length >= 2) {
					var index = Locale.get('Number.pluralRule', [value, params.length]);
					return params[index];
				}
			}
		}
	});

	// Expose the pluralRules:
	Smart.pluralRules = {
		pluralRuleEnglish: function(value, pluralCount) {
			switch (pluralCount) {
				case 2:
					// singular|plural
					return (value === 1) ? 0 : 1;
				case 3:
					// zero|singular|plural
					return (value === 0) ? 0 : (value === 1) ? 1 : 2;
				default:
					// negative|zero|singular|plural
					return (value < 0) ? 0 : (value === 0) ? 1 : (value === 1) ? 2 : 3;
			}
		}
	};

	// Implement some Plural Formatting rules:
	Locale.define('en-US', 'Number', 'pluralRule', Smart.pluralRules.pluralRuleEnglish);
	Locale.define('es-ES', 'Number', 'pluralRule', Smart.pluralRules.pluralRuleEnglish);


})();
