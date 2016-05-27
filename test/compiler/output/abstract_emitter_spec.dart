library angular2.test.compiler.output.abstract_emitter_spec;

import "package:angular2/testing_internal.dart"
    show
        AsyncTestCompleter,
        beforeEach,
        ddescribe,
        describe,
        el,
        expect,
        iit,
        inject,
        it,
        xit,
        TestComponentBuilder;
import "package:angular2/src/compiler/output/abstract_emitter.dart"
    show escapeSingleQuoteString;

main() {
  describe("AbstractEmitter", () {
    describe("escapeSingleQuoteString", () {
      it("should escape single quotes", () {
        expect(escapeSingleQuoteString('''\'''', false))
            .toEqual('''\'\\\'\'''');
      });
      it("should escape backslash", () {
        expect(escapeSingleQuoteString("\\", false)).toEqual('''\'\\\\\'''');
      });
      it("should escape newlines", () {
        expect(escapeSingleQuoteString("\n", false)).toEqual('''\'\\n\'''');
      });
      it("should escape carriage returns", () {
        expect(escapeSingleQuoteString("\r", false)).toEqual('''\'\\r\'''');
      });
      it("should escape \$", () {
        expect(escapeSingleQuoteString("\$", true)).toEqual('''\'\\\$\'''');
      });
      it("should not escape \$", () {
        expect(escapeSingleQuoteString("\$", false)).toEqual('''\'\$\'''');
      });
    });
  });
}
