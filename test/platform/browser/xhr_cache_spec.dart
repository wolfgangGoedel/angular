library angular2.test.platform.browser.xhr_cache_spec;

import "package:angular2/core.dart" show Component, provide;
import "package:angular2/compiler.dart" show UrlResolver, XHR;
import "package:angular2/testing_internal.dart"
    show
        AsyncTestCompleter,
        beforeEach,
        beforeEachProviders,
        ComponentFixture,
        ddescribe,
        describe,
        expect,
        fakeAsync,
        iit,
        inject,
        it,
        TestComponentBuilder,
        tick,
        xit;
import "package:angular2/src/facade/exceptions.dart" show BaseException;
import "package:angular2/src/platform/browser/xhr_cache.dart" show CachedXHR;
import "xhr_cache_setter.dart" show setTemplateCache;

main() {
  describe("CachedXHR", () {
    CachedXHR xhr;
    CachedXHR createCachedXHR() {
      setTemplateCache({"test.html": "<div>Hello</div>"});
      return new CachedXHR();
    }
    beforeEachProviders(() => [
          provide(UrlResolver, useClass: TestUrlResolver),
          provide(XHR, useFactory: createCachedXHR)
        ]);
    it("should throw exception if \$templateCache is not found", () {
      setTemplateCache(null);
      expect(() {
        xhr = new CachedXHR();
      }).toThrowErrorWith(
          "CachedXHR: Template cache was not found in \$templateCache.");
    });
    it(
        "should resolve the Promise with the cached file content on success",
        inject([AsyncTestCompleter], (async) {
          setTemplateCache({"test.html": "<div>Hello</div>"});
          xhr = new CachedXHR();
          xhr.get("test.html").then((text) {
            expect(text).toEqual("<div>Hello</div>");
            async.done();
          });
        }));
    it(
        "should reject the Promise on failure",
        inject([AsyncTestCompleter], (async) {
          xhr = new CachedXHR();
          xhr.get("unknown.html").then((text) {
            throw new BaseException("Not expected to succeed.");
          }).catchError((error) {
            async.done();
          });
        }));
    it(
        "should allow fakeAsync Tests to load components with templateUrl synchronously",
        fakeAsync(inject([TestComponentBuilder], (TestComponentBuilder tcb) {
          ComponentFixture fixture;
          tcb.createAsync(TestComponent).then((f) {
            fixture = f;
          });
          // This should initialize the fixture.
          tick();
          expect(fixture.debugElement.children[0].nativeElement)
              .toHaveText("Hello");
        })));
  });
}

@Component(selector: "test-cmp", templateUrl: "test.html")
class TestComponent {}

class TestUrlResolver extends UrlResolver {
  String resolve(String baseUrl, String url) {
    // Don't use baseUrl to get the same URL as templateUrl.

    // This is to remove any difference between Dart and TS tests.
    return url;
  }
}
