'use strict';"use strict";
var lang_1 = require('angular2/src/facade/lang');
var collection_1 = require('angular2/src/facade/collection');
var exceptions_1 = require('angular2/src/facade/exceptions');
var view_type_1 = require('./view_type');
var element_ref_1 = require('./element_ref');
var view_container_ref_1 = require('./view_container_ref');
var AppElement = (function () {
    function AppElement(index, parentIndex, parentView, nativeElement) {
        this.index = index;
        this.parentIndex = parentIndex;
        this.parentView = parentView;
        this.nativeElement = nativeElement;
        this.nestedViews = null;
        this.componentView = null;
    }
    Object.defineProperty(AppElement.prototype, "ref", {
        get: function () {
            if (lang_1.isBlank(this._ref)) {
                this._ref = new element_ref_1.ElementRef_(this);
            }
            return this._ref;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AppElement.prototype, "vcRef", {
        get: function () {
            if (lang_1.isBlank(this._vcRef)) {
                this._vcRef = new view_container_ref_1.ViewContainerRef_(this);
            }
            return this._vcRef;
        },
        enumerable: true,
        configurable: true
    });
    AppElement.prototype.initComponent = function (component, componentConstructorViewQueries, view) {
        this.component = component;
        this.componentConstructorViewQueries = componentConstructorViewQueries;
        this.componentView = view;
    };
    Object.defineProperty(AppElement.prototype, "parentInjector", {
        get: function () { return this.parentView.injector(this.parentIndex); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AppElement.prototype, "injector", {
        get: function () { return this.parentView.injector(this.index); },
        enumerable: true,
        configurable: true
    });
    AppElement.prototype.mapNestedViews = function (nestedViewClass, callback) {
        var result = [];
        if (lang_1.isPresent(this.nestedViews)) {
            this.nestedViews.forEach(function (nestedView) {
                if (nestedView.clazz === nestedViewClass) {
                    result.push(callback(nestedView));
                }
            });
        }
        return result;
    };
    AppElement.prototype.attachView = function (view, viewIndex) {
        if (view.type === view_type_1.ViewType.COMPONENT) {
            throw new exceptions_1.BaseException("Component views can't be moved!");
        }
        var nestedViews = this.nestedViews;
        if (nestedViews == null) {
            nestedViews = [];
            this.nestedViews = nestedViews;
        }
        collection_1.ListWrapper.insert(nestedViews, viewIndex, view);
        var refRenderNode;
        if (viewIndex > 0) {
            var prevView = nestedViews[viewIndex - 1];
            refRenderNode = prevView.lastRootNode;
        }
        else {
            refRenderNode = this.nativeElement;
        }
        if (lang_1.isPresent(refRenderNode)) {
            view.renderer.attachViewAfter(refRenderNode, view.flatRootNodes);
        }
        view.addToContentChildren(this);
    };
    AppElement.prototype.detachView = function (viewIndex) {
        var view = collection_1.ListWrapper.removeAt(this.nestedViews, viewIndex);
        if (view.type === view_type_1.ViewType.COMPONENT) {
            throw new exceptions_1.BaseException("Component views can't be moved!");
        }
        view.renderer.detachView(view.flatRootNodes);
        view.removeFromContentChildren(this);
        return view;
    };
    return AppElement;
}());
exports.AppElement = AppElement;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWxlbWVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRpZmZpbmdfcGx1Z2luX3dyYXBwZXItb3V0cHV0X3BhdGgtMUViclNPNEIudG1wL2FuZ3VsYXIyL3NyYy9jb3JlL2xpbmtlci9lbGVtZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxxQkFBdUMsMEJBQTBCLENBQUMsQ0FBQTtBQUNsRSwyQkFBMEIsZ0NBQWdDLENBQUMsQ0FBQTtBQUMzRCwyQkFBNEIsZ0NBQWdDLENBQUMsQ0FBQTtBQUs3RCwwQkFBdUIsYUFBYSxDQUFDLENBQUE7QUFDckMsNEJBQTBCLGVBQWUsQ0FBQyxDQUFBO0FBRTFDLG1DQUFrRCxzQkFBc0IsQ0FBQyxDQUFBO0FBSXpFO0lBU0Usb0JBQW1CLEtBQWEsRUFBUyxXQUFtQixFQUFTLFVBQXdCLEVBQzFFLGFBQWtCO1FBRGxCLFVBQUssR0FBTCxLQUFLLENBQVE7UUFBUyxnQkFBVyxHQUFYLFdBQVcsQ0FBUTtRQUFTLGVBQVUsR0FBVixVQUFVLENBQWM7UUFDMUUsa0JBQWEsR0FBYixhQUFhLENBQUs7UUFUOUIsZ0JBQVcsR0FBbUIsSUFBSSxDQUFDO1FBQ25DLGtCQUFhLEdBQWlCLElBQUksQ0FBQztJQVFGLENBQUM7SUFFekMsc0JBQUksMkJBQUc7YUFBUDtZQUNFLEVBQUUsQ0FBQyxDQUFDLGNBQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUN2QixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUkseUJBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNwQyxDQUFDO1lBQ0QsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7UUFDbkIsQ0FBQzs7O09BQUE7SUFFRCxzQkFBSSw2QkFBSzthQUFUO1lBQ0UsRUFBRSxDQUFDLENBQUMsY0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3pCLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxzQ0FBaUIsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUM1QyxDQUFDO1lBQ0QsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUM7UUFDckIsQ0FBQzs7O09BQUE7SUFFRCxrQ0FBYSxHQUFiLFVBQWMsU0FBYyxFQUFFLCtCQUFpRCxFQUNqRSxJQUFrQjtRQUM5QixJQUFJLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQztRQUMzQixJQUFJLENBQUMsK0JBQStCLEdBQUcsK0JBQStCLENBQUM7UUFDdkUsSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUM7SUFDNUIsQ0FBQztJQUVELHNCQUFJLHNDQUFjO2FBQWxCLGNBQWlDLE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDOzs7T0FBQTtJQUNyRixzQkFBSSxnQ0FBUTthQUFaLGNBQTJCLE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDOzs7T0FBQTtJQUV6RSxtQ0FBYyxHQUFkLFVBQWUsZUFBb0IsRUFBRSxRQUFrQjtRQUNyRCxJQUFJLE1BQU0sR0FBRyxFQUFFLENBQUM7UUFDaEIsRUFBRSxDQUFDLENBQUMsZ0JBQVMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2hDLElBQUksQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLFVBQUMsVUFBVTtnQkFDbEMsRUFBRSxDQUFDLENBQUMsVUFBVSxDQUFDLEtBQUssS0FBSyxlQUFlLENBQUMsQ0FBQyxDQUFDO29CQUN6QyxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO2dCQUNwQyxDQUFDO1lBQ0gsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDO1FBQ0QsTUFBTSxDQUFDLE1BQU0sQ0FBQztJQUNoQixDQUFDO0lBR0QsK0JBQVUsR0FBVixVQUFXLElBQWtCLEVBQUUsU0FBaUI7UUFDOUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksS0FBSyxvQkFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7WUFDckMsTUFBTSxJQUFJLDBCQUFhLENBQUMsaUNBQWlDLENBQUMsQ0FBQztRQUM3RCxDQUFDO1FBQ0QsSUFBSSxXQUFXLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQztRQUNuQyxFQUFFLENBQUMsQ0FBQyxXQUFXLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQztZQUN4QixXQUFXLEdBQUcsRUFBRSxDQUFDO1lBQ2pCLElBQUksQ0FBQyxXQUFXLEdBQUcsV0FBVyxDQUFDO1FBQ2pDLENBQUM7UUFDRCx3QkFBVyxDQUFDLE1BQU0sQ0FBQyxXQUFXLEVBQUUsU0FBUyxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ2pELElBQUksYUFBYSxDQUFDO1FBQ2xCLEVBQUUsQ0FBQyxDQUFDLFNBQVMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2xCLElBQUksUUFBUSxHQUFHLFdBQVcsQ0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDMUMsYUFBYSxHQUFHLFFBQVEsQ0FBQyxZQUFZLENBQUM7UUFDeEMsQ0FBQztRQUFDLElBQUksQ0FBQyxDQUFDO1lBQ04sYUFBYSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUM7UUFDckMsQ0FBQztRQUNELEVBQUUsQ0FBQyxDQUFDLGdCQUFTLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzdCLElBQUksQ0FBQyxRQUFRLENBQUMsZUFBZSxDQUFDLGFBQWEsRUFBRSxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7UUFDbkUsQ0FBQztRQUNELElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNsQyxDQUFDO0lBRUQsK0JBQVUsR0FBVixVQUFXLFNBQWlCO1FBQzFCLElBQUksSUFBSSxHQUFHLHdCQUFXLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsU0FBUyxDQUFDLENBQUM7UUFDN0QsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksS0FBSyxvQkFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7WUFDckMsTUFBTSxJQUFJLDBCQUFhLENBQUMsaUNBQWlDLENBQUMsQ0FBQztRQUM3RCxDQUFDO1FBRUQsSUFBSSxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBRTdDLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNyQyxNQUFNLENBQUMsSUFBSSxDQUFDO0lBQ2QsQ0FBQztJQUNILGlCQUFDO0FBQUQsQ0FBQyxBQW5GRCxJQW1GQztBQW5GWSxrQkFBVSxhQW1GdEIsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7aXNQcmVzZW50LCBpc0JsYW5rLCBUeXBlfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtMaXN0V3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9jb2xsZWN0aW9uJztcbmltcG9ydCB7QmFzZUV4Y2VwdGlvbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9leGNlcHRpb25zJztcblxuaW1wb3J0IHtJbmplY3Rvcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvZGknO1xuXG5pbXBvcnQge0FwcFZpZXd9IGZyb20gJy4vdmlldyc7XG5pbXBvcnQge1ZpZXdUeXBlfSBmcm9tICcuL3ZpZXdfdHlwZSc7XG5pbXBvcnQge0VsZW1lbnRSZWZffSBmcm9tICcuL2VsZW1lbnRfcmVmJztcblxuaW1wb3J0IHtWaWV3Q29udGFpbmVyUmVmLCBWaWV3Q29udGFpbmVyUmVmX30gZnJvbSAnLi92aWV3X2NvbnRhaW5lcl9yZWYnO1xuXG5pbXBvcnQge1F1ZXJ5TGlzdH0gZnJvbSAnLi9xdWVyeV9saXN0JztcblxuZXhwb3J0IGNsYXNzIEFwcEVsZW1lbnQge1xuICBwdWJsaWMgbmVzdGVkVmlld3M6IEFwcFZpZXc8YW55PltdID0gbnVsbDtcbiAgcHVibGljIGNvbXBvbmVudFZpZXc6IEFwcFZpZXc8YW55PiA9IG51bGw7XG5cbiAgcHJpdmF0ZSBfcmVmOiBFbGVtZW50UmVmXztcbiAgcHJpdmF0ZSBfdmNSZWY6IFZpZXdDb250YWluZXJSZWZfO1xuICBwdWJsaWMgY29tcG9uZW50OiBhbnk7XG4gIHB1YmxpYyBjb21wb25lbnRDb25zdHJ1Y3RvclZpZXdRdWVyaWVzOiBRdWVyeUxpc3Q8YW55PltdO1xuXG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBpbmRleDogbnVtYmVyLCBwdWJsaWMgcGFyZW50SW5kZXg6IG51bWJlciwgcHVibGljIHBhcmVudFZpZXc6IEFwcFZpZXc8YW55PixcbiAgICAgICAgICAgICAgcHVibGljIG5hdGl2ZUVsZW1lbnQ6IGFueSkge31cblxuICBnZXQgcmVmKCk6IEVsZW1lbnRSZWZfIHtcbiAgICBpZiAoaXNCbGFuayh0aGlzLl9yZWYpKSB7XG4gICAgICB0aGlzLl9yZWYgPSBuZXcgRWxlbWVudFJlZl8odGhpcyk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLl9yZWY7XG4gIH1cblxuICBnZXQgdmNSZWYoKTogVmlld0NvbnRhaW5lclJlZl8ge1xuICAgIGlmIChpc0JsYW5rKHRoaXMuX3ZjUmVmKSkge1xuICAgICAgdGhpcy5fdmNSZWYgPSBuZXcgVmlld0NvbnRhaW5lclJlZl8odGhpcyk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLl92Y1JlZjtcbiAgfVxuXG4gIGluaXRDb21wb25lbnQoY29tcG9uZW50OiBhbnksIGNvbXBvbmVudENvbnN0cnVjdG9yVmlld1F1ZXJpZXM6IFF1ZXJ5TGlzdDxhbnk+W10sXG4gICAgICAgICAgICAgICAgdmlldzogQXBwVmlldzxhbnk+KSB7XG4gICAgdGhpcy5jb21wb25lbnQgPSBjb21wb25lbnQ7XG4gICAgdGhpcy5jb21wb25lbnRDb25zdHJ1Y3RvclZpZXdRdWVyaWVzID0gY29tcG9uZW50Q29uc3RydWN0b3JWaWV3UXVlcmllcztcbiAgICB0aGlzLmNvbXBvbmVudFZpZXcgPSB2aWV3O1xuICB9XG5cbiAgZ2V0IHBhcmVudEluamVjdG9yKCk6IEluamVjdG9yIHsgcmV0dXJuIHRoaXMucGFyZW50Vmlldy5pbmplY3Rvcih0aGlzLnBhcmVudEluZGV4KTsgfVxuICBnZXQgaW5qZWN0b3IoKTogSW5qZWN0b3IgeyByZXR1cm4gdGhpcy5wYXJlbnRWaWV3LmluamVjdG9yKHRoaXMuaW5kZXgpOyB9XG5cbiAgbWFwTmVzdGVkVmlld3MobmVzdGVkVmlld0NsYXNzOiBhbnksIGNhbGxiYWNrOiBGdW5jdGlvbik6IGFueVtdIHtcbiAgICB2YXIgcmVzdWx0ID0gW107XG4gICAgaWYgKGlzUHJlc2VudCh0aGlzLm5lc3RlZFZpZXdzKSkge1xuICAgICAgdGhpcy5uZXN0ZWRWaWV3cy5mb3JFYWNoKChuZXN0ZWRWaWV3KSA9PiB7XG4gICAgICAgIGlmIChuZXN0ZWRWaWV3LmNsYXp6ID09PSBuZXN0ZWRWaWV3Q2xhc3MpIHtcbiAgICAgICAgICByZXN1bHQucHVzaChjYWxsYmFjayhuZXN0ZWRWaWV3KSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cblxuICBhdHRhY2hWaWV3KHZpZXc6IEFwcFZpZXc8YW55Piwgdmlld0luZGV4OiBudW1iZXIpIHtcbiAgICBpZiAodmlldy50eXBlID09PSBWaWV3VHlwZS5DT01QT05FTlQpIHtcbiAgICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKGBDb21wb25lbnQgdmlld3MgY2FuJ3QgYmUgbW92ZWQhYCk7XG4gICAgfVxuICAgIHZhciBuZXN0ZWRWaWV3cyA9IHRoaXMubmVzdGVkVmlld3M7XG4gICAgaWYgKG5lc3RlZFZpZXdzID09IG51bGwpIHtcbiAgICAgIG5lc3RlZFZpZXdzID0gW107XG4gICAgICB0aGlzLm5lc3RlZFZpZXdzID0gbmVzdGVkVmlld3M7XG4gICAgfVxuICAgIExpc3RXcmFwcGVyLmluc2VydChuZXN0ZWRWaWV3cywgdmlld0luZGV4LCB2aWV3KTtcbiAgICB2YXIgcmVmUmVuZGVyTm9kZTtcbiAgICBpZiAodmlld0luZGV4ID4gMCkge1xuICAgICAgdmFyIHByZXZWaWV3ID0gbmVzdGVkVmlld3Nbdmlld0luZGV4IC0gMV07XG4gICAgICByZWZSZW5kZXJOb2RlID0gcHJldlZpZXcubGFzdFJvb3ROb2RlO1xuICAgIH0gZWxzZSB7XG4gICAgICByZWZSZW5kZXJOb2RlID0gdGhpcy5uYXRpdmVFbGVtZW50O1xuICAgIH1cbiAgICBpZiAoaXNQcmVzZW50KHJlZlJlbmRlck5vZGUpKSB7XG4gICAgICB2aWV3LnJlbmRlcmVyLmF0dGFjaFZpZXdBZnRlcihyZWZSZW5kZXJOb2RlLCB2aWV3LmZsYXRSb290Tm9kZXMpO1xuICAgIH1cbiAgICB2aWV3LmFkZFRvQ29udGVudENoaWxkcmVuKHRoaXMpO1xuICB9XG5cbiAgZGV0YWNoVmlldyh2aWV3SW5kZXg6IG51bWJlcik6IEFwcFZpZXc8YW55PiB7XG4gICAgdmFyIHZpZXcgPSBMaXN0V3JhcHBlci5yZW1vdmVBdCh0aGlzLm5lc3RlZFZpZXdzLCB2aWV3SW5kZXgpO1xuICAgIGlmICh2aWV3LnR5cGUgPT09IFZpZXdUeXBlLkNPTVBPTkVOVCkge1xuICAgICAgdGhyb3cgbmV3IEJhc2VFeGNlcHRpb24oYENvbXBvbmVudCB2aWV3cyBjYW4ndCBiZSBtb3ZlZCFgKTtcbiAgICB9XG5cbiAgICB2aWV3LnJlbmRlcmVyLmRldGFjaFZpZXcodmlldy5mbGF0Um9vdE5vZGVzKTtcblxuICAgIHZpZXcucmVtb3ZlRnJvbUNvbnRlbnRDaGlsZHJlbih0aGlzKTtcbiAgICByZXR1cm4gdmlldztcbiAgfVxufVxuIl19