library angular2.test.common.pipes.replace_pipe_spec;

import "package:angular2/testing_internal.dart"
    show
        ddescribe,
        describe,
        it,
        iit,
        xit,
        expect,
        beforeEach,
        afterEach,
        browserDetection,
        inject,
        TestComponentBuilder,
        AsyncTestCompleter;
import "package:angular2/common.dart" show ReplacePipe;
import "package:angular2/src/facade/lang.dart" show RegExpWrapper, StringJoiner;

main() {
  describe("ReplacePipe", () {
    num someNumber;
    var str;
    var pipe;
    beforeEach(() {
      someNumber = 42;
      str = "Douglas Adams";
      pipe = new ReplacePipe();
    });
    describe("transform", () {
      it("should not support input other than strings and numbers", () {
        expect(() => pipe.transform({}, ["Douglas", "Hugh"])).toThrow();
        expect(() => pipe.transform([1, 2, 3], ["Douglas", "Hugh"])).toThrow();
      });
      it("should not support patterns other than strings and regular expressions",
          () {
        expect(() => pipe.transform(str, [{}, "Hugh"])).toThrow();
        expect(() => pipe.transform(str, [null, "Hugh"])).toThrow();
        expect(() => pipe.transform(str, [123, "Hugh"])).toThrow();
      });
      it("should not support replacements other than strings and functions",
          () {
        expect(() => pipe.transform(str, ["Douglas", {}])).toThrow();
        expect(() => pipe.transform(str, ["Douglas", null])).toThrow();
        expect(() => pipe.transform(str, ["Douglas", 123])).toThrow();
      });
      it("should return a new string with the pattern replaced", () {
        var result1 = pipe.transform(str, ["Douglas", "Hugh"]);
        var result2 = pipe.transform(str, [RegExpWrapper.create("a"), "_"]);
        var result3 =
            pipe.transform(str, [RegExpWrapper.create("a", "i"), "_"]);
        var f = ((x) {
          return "Adams!";
        });
        var result4 = pipe.transform(str, ["Adams", f]);
        var result5 = pipe.transform(someNumber, ["2", "4"]);
        expect(result1).toEqual("Hugh Adams");
        expect(result2).toEqual("Dougl_s Ad_ms");
        expect(result3).toEqual("Dougl_s _d_ms");
        expect(result4).toEqual("Douglas Adams!");
        expect(result5).toEqual("44");
      });
    });
  });
}
