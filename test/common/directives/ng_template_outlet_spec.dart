library angular2.test.common.directives.ng_template_outlet_spec;

import "package:angular2/testing_internal.dart"
    show
        AsyncTestCompleter,
        TestComponentBuilder,
        beforeEach,
        ddescribe,
        describe,
        el,
        expect,
        iit,
        inject,
        it,
        xit;
import "package:angular2/core.dart"
    show Component, Directive, TemplateRef, ContentChildren, QueryList;
import "package:angular2/src/common/directives/ng_template_outlet.dart"
    show NgTemplateOutlet;

main() {
  describe("insert", () {
    it(
        "should do nothing if templateRef is null",
        inject([TestComponentBuilder, AsyncTestCompleter],
            (TestComponentBuilder tcb, async) {
          var template = '''<template [ngTemplateOutlet]="null"></template>''';
          tcb
              .overrideTemplate(TestComponent, template)
              .createAsync(TestComponent)
              .then((fixture) {
            fixture.detectChanges();
            expect(fixture.nativeElement).toHaveText("");
            async.done();
          });
        }));
    it(
        "should insert content specified by TemplateRef",
        inject([TestComponentBuilder, AsyncTestCompleter],
            (TestComponentBuilder tcb, async) {
          var template =
              '''<tpl-refs #refs="tplRefs"><template>foo</template></tpl-refs><template [ngTemplateOutlet]="currentTplRef"></template>''';
          tcb
              .overrideTemplate(TestComponent, template)
              .createAsync(TestComponent)
              .then((fixture) {
            fixture.detectChanges();
            expect(fixture.nativeElement).toHaveText("");
            var refs = fixture.debugElement.children[0].getLocal("refs");
            fixture.componentInstance.currentTplRef = refs.tplRefs.first;
            fixture.detectChanges();
            expect(fixture.nativeElement).toHaveText("foo");
            async.done();
          });
        }));
    it(
        "should clear content if TemplateRef becomes null",
        inject([TestComponentBuilder, AsyncTestCompleter],
            (TestComponentBuilder tcb, async) {
          var template =
              '''<tpl-refs #refs="tplRefs"><template>foo</template></tpl-refs><template [ngTemplateOutlet]="currentTplRef"></template>''';
          tcb
              .overrideTemplate(TestComponent, template)
              .createAsync(TestComponent)
              .then((fixture) {
            fixture.detectChanges();
            var refs = fixture.debugElement.children[0].getLocal("refs");
            fixture.componentInstance.currentTplRef = refs.tplRefs.first;
            fixture.detectChanges();
            expect(fixture.nativeElement).toHaveText("foo");
            fixture.componentInstance.currentTplRef = null;
            fixture.detectChanges();
            expect(fixture.nativeElement).toHaveText("");
            async.done();
          });
        }));
    it(
        "should swap content if TemplateRef changes",
        inject([TestComponentBuilder, AsyncTestCompleter],
            (TestComponentBuilder tcb, async) {
          var template =
              '''<tpl-refs #refs="tplRefs"><template>foo</template><template>bar</template></tpl-refs><template [ngTemplateOutlet]="currentTplRef"></template>''';
          tcb
              .overrideTemplate(TestComponent, template)
              .createAsync(TestComponent)
              .then((fixture) {
            fixture.detectChanges();
            var refs = fixture.debugElement.children[0].getLocal("refs");
            fixture.componentInstance.currentTplRef = refs.tplRefs.first;
            fixture.detectChanges();
            expect(fixture.nativeElement).toHaveText("foo");
            fixture.componentInstance.currentTplRef = refs.tplRefs.last;
            fixture.detectChanges();
            expect(fixture.nativeElement).toHaveText("bar");
            async.done();
          });
        }));
  });
}

@Directive(selector: "tpl-refs", exportAs: "tplRefs")
class CaptureTplRefs {
  @ContentChildren(TemplateRef)
  QueryList<TemplateRef> tplRefs;
}

@Component(
    selector: "test-cmp",
    directives: const [NgTemplateOutlet, CaptureTplRefs],
    template: "")
class TestComponent {
  TemplateRef currentTplRef;
}
