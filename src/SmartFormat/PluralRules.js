(function(window){

	window.PluralRules = {
		_codeMap: {} // Map of language codes to rule names
		, _rules: {} // Map of rule names to rules

		, default: null
		, setDefault: function(languageCode) {
			this.default = this.getRule(languageCode);
		}

		, mapLanguageCodes: function(languageCodes, ruleName) {
			languageCodes = ',' + languageCodes.toLowerCase() + ',';
			ruleName = ruleName.toLowerCase();

			this._codeMap[languageCodes] = ruleName;
		}
		, defineRule: function(ruleName, pluralRule) {
			ruleName = ruleName.toLowerCase();

			this._rules[ruleName] = pluralRule;
		}
		, getRule: function(languageCode) {
			languageCode = languageCode.toLowerCase();

			// You can look for a rule by name:
			if (languageCode in this._rules) {
				return this._rules[languageCode];
			}

			// Search for an "exact match" (either 2 letter code or 4 letter code)
			var exactLanguageCode = ',' + languageCode + ',';
			for (var languageCodes in this._codeMap) {
				if (!this._codeMap.hasOwnProperty(languageCodes)) continue;

				var isExactMatch = (languageCodes.indexOf(exactLanguageCode) !== -1);
				if (isExactMatch) {
					var ruleName = this._codeMap[languageCodes];
					return this._rules[ruleName];
				}
			}

			// Search for a "generic match" (2 letter code)
			if (languageCode.indexOf('-') !== -1) {
				var twoLetterCode = languageCode.split('-')[0];
				return this.getRule(twoLetterCode);
			} else {
				return null;
			}
		}
	};

})(this);



(function() {
	/**
	 * Much of this language information came from the following url:
	 * http://www.gnu.org/s/hello/manual/gettext/Plural-forms.html
	 * The language codes came from:
	 * http://www.loc.gov/standards/iso639-2/php/code_list.php
	 */


	/**
	 * Germanic family
	 *  English, German, Dutch, Swedish, Danish, Norwegian, Faroese
	 * Romanic family
	 *  Spanish, Portuguese, Italian, Bulgarian
	 * Latin/Greek family
	 *  Greek
	 * Finno-Ugric family
	 *  Finnish, Estonian
	 * Semitic family
	 *  Hebrew
	 * Artificial
	 *  Esperanto
	 * Finno-Ugric family
	 *  Hungarian
	 * Turkic/Altaic family
	 *  Turkish
	 */
	PluralRules.mapLanguageCodes('en,de,nl,sv,da,no,nn,nb,fo,es,pt,it,bg,el,fi,et,he,eo,hu,tr', 'english');
	PluralRules.defineRule('english', function PluralRule_english(value, choices) {
		// singular used for 1.
		// Optional special cases for zero and negative

		// singular, plural
		// zero, singular, plural
		// negative, zero, singular, plural
		if (choices == 2) {
			return (value == 1 ? 0 : 1);
		} else if (choices == 3) {
			return (value == 0) ? 0 : (value == 1) ? 1 : 2;
		} else {
			return (value < 0) ? 0 : (value == 0) ? 1 : (value == 1) ? 2 : 3;
		}
	});

	/**
	 * Romanic family
	 *  Brazilian Portuguese, French
	 */
	PluralRules.mapLanguageCodes('fr', 'french');
	PluralRules.defineRule('french', function PluralRule_french(value, choices) {
		// singular used for zero and one
		return (value == 0 || value == 1) ? 0 : 1;
	});

	/**
	 * Baltic family
	 *  Latvian
	 */
	PluralRules.mapLanguageCodes('lv', 'latvian');
	PluralRules.defineRule('latvian', function PluralRule_latvian(value, choices) {
		// singular used for
		// zero, singular, plural
		// Three forms, special case for zero
		return (value % 10 == 1 && value % 100 != 11) ? 0 : (value != 0) ? 1 : 2;
	});

	/**
	 * Celtic
	 *  Gaeilge (Irish)
	 */
	PluralRules.mapLanguageCodes('ga', 'irish');
	PluralRules.defineRule('irish', function PluralRule_irish(value, choices) {
		// Three forms, special cases for one and two
		return (value == 1) ? 0 : (value == 2) ? 1 : 2;
	});

	/**
	 * Romanic family
	 *  Romanian
	 */
	PluralRules.mapLanguageCodes('ro', 'romanian');
	PluralRules.defineRule('romanian', function PluralRule_romanian(value, choices) {
		// Three forms, special case for numbers ending in 00 or [2-9][0-9]
		return (value == 1) ? 0 : (value == 0 || (value % 100 > 0 && value % 100 < 20)) ? 1 : 2;
	});

	/**
	 * Baltic family
	 *  Lithuanian
	 */
	PluralRules.mapLanguageCodes('lt', 'lithuanian');
	PluralRules.defineRule('lithuanian', function PluralRule_lithuanian(value, choices) {
		// Three forms, special case for numbers ending in 1[2-9]
		return (value % 10 == 1 && value % 100 != 11) ? 0 : (value % 10 >= 2 && (value % 100 < 10 || value % 100 >= 20)) ? 1 : 2;
	});

	/**
	 * Slavic family
	 *  Russian, Ukrainian, Serbian, Croatian
	 */
	PluralRules.mapLanguageCodes('ru,uk,sr,hr', 'russian');
	PluralRules.defineRule('russian', function PluralRule_russian(value, choices) {
		// Three forms, special cases for numbers ending in 1 and 2, 3, 4, except those ending in 1[1-4]
		return (value % 10 == 1 && value % 100 != 11) ? 0 : (value % 10 >= 2 && value % 10 <= 4 && (value % 100 < 10 || value % 100 >= 20)) ? 1 : 2;
	});

	/**
	 * Slavic family
	 *  Czech, Slovak
	 */
	PluralRules.mapLanguageCodes('cs,sk', 'czech');
	PluralRules.defineRule('czech', function PluralRule_czech(value, choices) {
		// Three forms, special cases for 1 and 2, 3, 4
		return (value == 1) ? 0 : (value >= 2 && value <= 4) ? 1 : 2;
	});

	/**
	 * Slavic family
	 *  Polish
	 */
	PluralRules.mapLanguageCodes('pl', 'polish');
	PluralRules.defineRule('polish', function PluralRule_polish(value, choices) {
		// Three forms, special case for one and some numbers ending in 2, 3, or 4
		return (value == 1) ? 0 : (value % 10 >= 2 && value % 10 <= 4 && (value % 100 < 10 || value % 100 >= 20)) ? 1 : 2;
	});

	/**
	 * Slavic family
	 *  Slovenian
	 */
	PluralRules.mapLanguageCodes('sl', 'slovenian');
	PluralRules.defineRule('slovenian', function PluralRule_slovenian(value, choices) {
		// Four forms, special case for one and all numbers ending in 02, 03, or 04
		return (value % 100 == 1) ? 0 : (value % 100 == 2) ? 1 : (value % 100 == 3 || value % 100 == 4) ? 2 : 3;
	});


})();
