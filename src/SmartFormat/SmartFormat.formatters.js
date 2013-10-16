Smart.SmartFormat.defineFormatters({
	nested: function(value, format, formatInfo) {
		if (!formatInfo.hasPlaceholder) return;

		return formatInfo.smartFormat._formatParsed(format, value);
	}
	,
	number: function(value, format, formatInfo) {
		if (typeof value !== 'number') return;

		return value.toFixed(2);
	}
	,
	default: function(value, format, formatInfo) {
		if (typeof value.toString === 'function')
			return value.toString(formatInfo.format);

		return String(value);
	}
});


Smart.addFormatters('nested', 'number', 'default');