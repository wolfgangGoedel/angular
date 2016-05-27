library angular2.src.core.linker.element;

import "package:angular2/src/facade/lang.dart" show isPresent, isBlank, Type;
import "package:angular2/src/facade/collection.dart" show ListWrapper;
import "package:angular2/src/facade/exceptions.dart" show BaseException;
import "package:angular2/src/core/di.dart" show Injector;
import "view.dart" show AppView;
import "view_type.dart" show ViewType;
import "element_ref.dart" show ElementRef_;
import "view_container_ref.dart" show ViewContainerRef, ViewContainerRef_;
import "query_list.dart" show QueryList;

class AppElement {
  num index;
  num parentIndex;
  AppView<dynamic> parentView;
  dynamic nativeElement;
  List<AppView<dynamic>> nestedViews = null;
  AppView<dynamic> componentView = null;
  ElementRef_ _ref;
  ViewContainerRef_ _vcRef;
  dynamic component;
  List<QueryList<dynamic>> componentConstructorViewQueries;
  AppElement(
      this.index, this.parentIndex, this.parentView, this.nativeElement) {}
  ElementRef_ get ref {
    if (isBlank(this._ref)) {
      this._ref = new ElementRef_(this);
    }
    return this._ref;
  }

  ViewContainerRef_ get vcRef {
    if (isBlank(this._vcRef)) {
      this._vcRef = new ViewContainerRef_(this);
    }
    return this._vcRef;
  }

  initComponent(
      dynamic component,
      List<QueryList<dynamic>> componentConstructorViewQueries,
      AppView<dynamic> view) {
    this.component = component;
    this.componentConstructorViewQueries = componentConstructorViewQueries;
    this.componentView = view;
  }

  Injector get parentInjector {
    return this.parentView.injector(this.parentIndex);
  }

  Injector get injector {
    return this.parentView.injector(this.index);
  }

  List<dynamic> mapNestedViews(dynamic nestedViewClass, Function callback) {
    var result = [];
    if (isPresent(this.nestedViews)) {
      this.nestedViews.forEach((nestedView) {
        if (identical(nestedView.clazz, nestedViewClass)) {
          result.add(callback(nestedView));
        }
      });
    }
    return result;
  }

  attachView(AppView<dynamic> view, num viewIndex) {
    if (identical(view.type, ViewType.COMPONENT)) {
      throw new BaseException('''Component views can\'t be moved!''');
    }
    var nestedViews = this.nestedViews;
    if (nestedViews == null) {
      nestedViews = [];
      this.nestedViews = nestedViews;
    }
    ListWrapper.insert(nestedViews, viewIndex, view);
    var refRenderNode;
    if (viewIndex > 0) {
      var prevView = nestedViews[viewIndex - 1];
      refRenderNode = prevView.lastRootNode;
    } else {
      refRenderNode = this.nativeElement;
    }
    if (isPresent(refRenderNode)) {
      view.renderer.attachViewAfter(refRenderNode, view.flatRootNodes);
    }
    view.addToContentChildren(this);
  }

  AppView<dynamic> detachView(num viewIndex) {
    var view = ListWrapper.removeAt(this.nestedViews, viewIndex);
    if (identical(view.type, ViewType.COMPONENT)) {
      throw new BaseException('''Component views can\'t be moved!''');
    }
    view.renderer.detachView(view.flatRootNodes);
    view.removeFromContentChildren(this);
    return view;
  }
}
