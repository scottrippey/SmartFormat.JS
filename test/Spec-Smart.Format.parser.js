describe("Smart.Format.parser", function() {
	it("parses templates with just selectors", function() {

		expect(
			Smart.Format.parse(" LITERAL { SELECTOR 1 } MORE LITERAL ")
		).toEqual([
				" LITERAL ",
				{ selector: " SELECTOR 1 ", formats: [ ] },
				" MORE LITERAL "
			]);

		expect(
			Smart.Format.parse(" LITERAL { SELECTOR 1 } MIDDLE LITERAL { SELECTOR 2 } MORE LITERAL ")
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
			Smart.Format.parse(" LITERAL { SELECTOR : FORMAT } MORE LITERAL ")
		).toEqual([
				" LITERAL ",
				{ selector: " SELECTOR ", formats: [ [" FORMAT "] ] },
				" MORE LITERAL "
			]);

		expect(
			Smart.Format.parse(" LITERAL { SELECTOR : FORMAT 1 : FORMAT 2 : FORMAT 3 } MORE LITERAL ")
		).toEqual([
				" LITERAL ",
				{ selector: " SELECTOR ", formats: [ [" FORMAT 1 "], [" FORMAT 2 "], [" FORMAT 3 "] ] },
				" MORE LITERAL "
			]);
	});
	it("parses nested templates", function() {

		expect(
			Smart.Format.parse("{SELECTOR:FORMAT{NESTED}}")
		).toEqual([
				{ selector: "SELECTOR", formats: [
					["FORMAT", { selector: "NESTED", formats: [] } ]
				] }
			]);

		expect(
			Smart.Format.parse(" LITERAL { SELECTOR : FORMAT 1 : FORMAT 2 { NESTED } :" +
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
			Smart.Format.parse(" JUST LITERAL ")
		).toEqual([
				" JUST LITERAL "
			]);
		expect(
			Smart.Format.parse("")
		).toEqual([ ]);
		expect(
			Smart.Format.parse(":")
		).toEqual([
				":"
			]);

	});
	it("handles edge cases for shallow templates", function() {
		expect(
			Smart.Format.parse("{}")
		).toEqual([
				{ selector: "", formats: [ ] }
			]);

		expect(
			Smart.Format.parse(":{}")
		).toEqual([
				":",
				{ selector: "", formats: [ ] }
			]);

		expect(
			Smart.Format.parse("{}:")
		).toEqual([
				{ selector: "", formats: [ ] },
				":"
			]);
		expect(
			Smart.Format.parse("{}{}")
		).toEqual([
				{ selector: "", formats: [ ] },
				{ selector: "", formats: [ ] }
			]);
		expect(
			Smart.Format.parse("{}{}{}")
		).toEqual([
				{ selector: "", formats: [ ] },
				{ selector: "", formats: [ ] },
				{ selector: "", formats: [ ] }
			]);
		expect(
			Smart.Format.parse(":{}:{}:{}:")
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
			Smart.Format.parse("{S}")
		).toEqual([
				{ selector: "S", formats: [ ] }
			]);

		expect(
			Smart.Format.parse("L{}")
		).toEqual([
				"L",
				{ selector: "", formats: [ ] }
			]);

		expect(
			Smart.Format.parse("{}L")
		).toEqual([
				{ selector: "", formats: [ ] },
				"L"
			]);

		expect(
			Smart.Format.parse("1{2}3")
		).toEqual([
				"1",
				{ selector: "2", formats: [ ] },
				"3"
			]);

		expect(
			Smart.Format.parse("{:}")
		).toEqual([
				{ selector: "", formats: [ [ ] ] }
			]);

		expect(
			Smart.Format.parse("{:::}")
		).toEqual([
				{ selector: "", formats: [ [], [], [] ] }
			]);

		expect(
			Smart.Format.parse("{:F}")
		).toEqual([
				{ selector: "", formats: [ [ "F" ] ] }
			]);

		expect(
			Smart.Format.parse("{S:}")
		).toEqual([
				{ selector: "S", formats: [ [ ] ] }
			]);

		expect(
			Smart.Format.parse("{S:F}")
		).toEqual([
				{ selector: "S", formats: [ [ "F" ] ] }
			]);

		expect(
			Smart.Format.parse("{S:1:2}")
		).toEqual([
				{ selector: "S", formats: [ [ "1" ], [ "2" ] ] }
			]);
	});
	it("handles edge cases for nesting", function() {
		expect(
			Smart.Format.parse("{:{}}")
		).toEqual([
				{ selector: "", formats: [ [ { selector: "", formats: [] } ] ] }
			]);
		expect(
			Smart.Format.parse("{:{}:{}:{}:{}}{:{}:{}:{}}{:{}:{}}{:{}}{:}{}")
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
			Smart.Format.parse("{1:{2.3:{:{4:{5:{:N}}}}}}")
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