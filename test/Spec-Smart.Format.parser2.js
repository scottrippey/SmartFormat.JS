describe("Smart.Format.Parser2", function() {
	var Parser = Smart.Format.Parser;
	var parser = new Parser();
	
	/** Goals:
	 * List, with nesting, context, perhaps overflow: " People: Scott, Jen, Matthew, and Charlotte "
	 * Plural, with parameters and easy nesting: "There are 4 people" / "There is 1 person" / "There are no people"
	 * Conditional, with truthy and falsey, and access to outer scope: "Written by Scott and Jen" / "Written by 4 authors"
	 *
	 * Multiple filters
	 * Named parameters?
	 * 
	 * Chainable filters? Probably not, since nesting exists
	 */
	var scope = {
		remainderLink: function(text) {
			return "<a ng-click='toggle()'>" + text + "</a>";
		}
	};
	
	
	parser.parse(" People: { some.expression():list:{first}|, |, and |2|, and {remainderLink:{remainder} others}...}");
	parser.parse(" People: { some.expression():list:{first}|, |, and |2|, and <a {remainderLinkAttrs}>{remainder} others</a>}...}");
	parser.parse(" People: { some.expression():{first}|, |, and |2|, and <a {remainderLinkAttrs}>{remainder} others</a>}...}");
	parser.parse(" There { some.expression():plural:are no items|is 1 item|are {} items } ");
	
	
	
	
	// pipe-colon (ala Angular)
	parser.parse(" People: { some.expression() | list:'{first}:', ':', and' } ");
	parser.parse(" There { some.expression() | plural:'are no items':'is {} item':'are {} items' } ");
	//    without quotes
	parser.parse(" People: { some.expression() | list:{first}:, :, and } ");
	parser.parse(" There { some.expression() | plural:are no items:is 1 item:are {} items } ");
	
	// All Pipes
	parser.parse(" People: { some.expression()|list|{first}|, |, and } ");
	parser.parse(" People: { some.expression():list|{first}|, |, and } ");
	parser.parse(" People: { some.expression():list:{first}|, |, and } ");
	parser.parse(" People: { some.expression(),list:{first}|, |, and } ");
	parser.parse(" People: { some.expression():list:{first}|, |, and } ");
	parser.parse(" There { some.expression()|plural|are no items|is 1 item|are {} items} ");
	parser.parse(" There { some.expression():plural|are no items|is 1 item|are {} items} ");
	parser.parse(" There { some.expression():plural:are no items|is 1 item|are {} items} ");
	
	// parenthesis-comma (ala Javascript)
	parser.parse(" { some.expression() : list('{first}',', ',', and ') } ");
	parser.parse(" There { some.expression() : plural(are no items,is 1 item,are {} items) } ");
	parser.parse(" There { some.expression().plural(are no items,is 1 item,are {} items) } ");
	
	
	it("parses templates with just selectors", function() {

		expect(
			parser.parse(" LITERAL { SELECTOR 1 } MORE LITERAL ")
		).toEqual([
				" LITERAL ",
				{ selector: " SELECTOR 1 ", formats: [ ] },
				" MORE LITERAL "
			]);

		expect(
			parser.parse(" LITERAL { SELECTOR 1 } MIDDLE LITERAL { SELECTOR 2 } MORE LITERAL ")
		).toEqual([
				" LITERAL ",
				{ selector: " SELECTOR 1 ", formats: [ ] },
				" MIDDLE LITERAL ",
				{ selector: " SELECTOR 2 ", formats: [ ] },
				" MORE LITERAL "
			]);
	});
	it("parses templates with formats", function() {
		expect(
			parser.parse(" LITERAL { SELECTOR : FORMAT } MORE LITERAL ")
		).toEqual([
				" LITERAL ",
				{ selector: " SELECTOR ", formats: [ [" FORMAT "] ] },
				" MORE LITERAL "
			]);

		expect(
			parser.parse(" LITERAL { SELECTOR : FORMAT 1 : FORMAT 2 : FORMAT 3 } MORE LITERAL ")
		).toEqual([
				" LITERAL ",
				{ selector: " SELECTOR ", formats: [ [" FORMAT 1 "], [" FORMAT 2 "], [" FORMAT 3 "] ] },
				" MORE LITERAL "
			]);
	});
	it("parses nested templates", function() {

		expect(
			parser.parse("{SELECTOR:FORMAT{NESTED}}")
		).toEqual([
				{ selector: "SELECTOR", formats: [
					["FORMAT", { selector: "NESTED", formats: [] } ]
				] }
			]);

		expect(
			parser.parse(" LITERAL { SELECTOR : FORMAT 1 : FORMAT 2 { NESTED } :" +
				" FORMAT 3 { NESTED.SELECTOR : NESTED TEMPLATE 1 : NESTED TEMPLATE 2 } :" +
				" FORMAT 4 {} : FORMAT 5 } MORE LITERAL ")
		).toEqual([
				" LITERAL ",
				{ selector: " SELECTOR ", formats: [
					[ " FORMAT 1 " ],
					[ " FORMAT 2 ", { selector: " NESTED ", formats: [ ] }, " " ],
					[ " FORMAT 3 ", { selector: " NESTED.SELECTOR ", formats: [ [ " NESTED TEMPLATE 1 " ], [ " NESTED TEMPLATE 2 " ] ] }, " "],
					[ " FORMAT 4 ", { selector: "", formats: [] }, " " ],
					[ " FORMAT 5 " ]
				]},
				" MORE LITERAL "
			]);


	});

	it("handles edge cases for literals", function() {

		expect(
			parser.parse(" JUST LITERAL ")
		).toEqual([
				" JUST LITERAL "
			]);
		expect(
			parser.parse("")
		).toEqual([ ]);
		expect(
			parser.parse(":")
		).toEqual([
				":"
			]);

	});
	it("handles edge cases for shallow templates", function() {
		expect(
			parser.parse("{}")
		).toEqual([
				{ selector: "", formats: [ ] }
			]);

		expect(
			parser.parse(":{}")
		).toEqual([
				":",
				{ selector: "", formats: [ ] }
			]);

		expect(
			parser.parse("{}:")
		).toEqual([
				{ selector: "", formats: [ ] },
				":"
			]);
		expect(
			parser.parse("{}{}")
		).toEqual([
				{ selector: "", formats: [ ] },
				{ selector: "", formats: [ ] }
			]);
		expect(
			parser.parse("{}{}{}")
		).toEqual([
				{ selector: "", formats: [ ] },
				{ selector: "", formats: [ ] },
				{ selector: "", formats: [ ] }
			]);
		expect(
			parser.parse(":{}:{}:{}:")
		).toEqual([
				":",
				{ selector: "", formats: [ ] },
				":",
				{ selector: "", formats: [ ] },
				":",
				{ selector: "", formats: [ ] },
				":"
			]);

		expect(
			parser.parse("{S}")
		).toEqual([
				{ selector: "S", formats: [ ] }
			]);

		expect(
			parser.parse("L{}")
		).toEqual([
				"L",
				{ selector: "", formats: [ ] }
			]);

		expect(
			parser.parse("{}L")
		).toEqual([
				{ selector: "", formats: [ ] },
				"L"
			]);

		expect(
			parser.parse("1{2}3")
		).toEqual([
				"1",
				{ selector: "2", formats: [ ] },
				"3"
			]);

		expect(
			parser.parse("{:}")
		).toEqual([
				{ selector: "", formats: [ [ ] ] }
			]);

		expect(
			parser.parse("{:::}")
		).toEqual([
				{ selector: "", formats: [ [], [], [] ] }
			]);

		expect(
			parser.parse("{:F}")
		).toEqual([
				{ selector: "", formats: [ [ "F" ] ] }
			]);

		expect(
			parser.parse("{S:}")
		).toEqual([
				{ selector: "S", formats: [ [ ] ] }
			]);

		expect(
			parser.parse("{S:F}")
		).toEqual([
				{ selector: "S", formats: [ [ "F" ] ] }
			]);

		expect(
			parser.parse("{S:1:2}")
		).toEqual([
				{ selector: "S", formats: [ [ "1" ], [ "2" ] ] }
			]);
	});
	it("handles edge cases for nesting", function() {
		expect(
			parser.parse("{:{}}")
		).toEqual([
				{ selector: "", formats: [ [ { selector: "", formats: [] } ] ] }
			]);
		expect(
			parser.parse("{:{}:{}:{}:{}}{:{}:{}:{}}{:{}:{}}{:{}}{:}{}")
		).toEqual([
				{ selector: "", formats: [
					[ { selector: "", formats: [] } ],
					[ { selector: "", formats: [] } ],
					[ { selector: "", formats: [] } ],
					[ { selector: "", formats: [] } ]
				] },
				{ selector: "", formats: [
					[ { selector: "", formats: [] } ],
					[ { selector: "", formats: [] } ],
					[ { selector: "", formats: [] } ]
				] },
				{ selector: "", formats: [
					[ { selector: "", formats: [] } ],
					[ { selector: "", formats: [] } ]
				] },
				{ selector: "", formats: [
					[ { selector: "", formats: [] } ]
				] },
				{ selector: "", formats: [ [] ] },
				{ selector: "", formats: [ ] }
			]);
		expect(
			parser.parse("{1:{2.3:{:{4:{5:{:N}}}}}}")
		).toEqual([
				{ selector: "1", formats: [ [
					{ selector: "2.3", formats: [ [
						{ selector: "", formats: [ [
							{ selector: "4", formats: [ [
								{ selector: "5", formats: [ [
									{ selector: "", formats: [ [
										"N"
									] ] }
								] ] }
							] ] }
						] ] }
					] ] }
				] ] }
			]);



	});

});