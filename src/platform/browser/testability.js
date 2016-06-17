'use strict';"use strict";
var collection_1 = require('angular2/src/facade/collection');
var lang_1 = require('angular2/src/facade/lang');
var dom_adapter_1 = require('angular2/src/platform/dom/dom_adapter');
var PublicTestability = (function () {
    function PublicTestability(testability) {
        this._testability = testability;
    }
    PublicTestability.prototype.isStable = function () { return this._testability.isStable(); };
    PublicTestability.prototype.whenStable = function (callback) { this._testability.whenStable(callback); };
    PublicTestability.prototype.findBindings = function (using, provider, exactMatch) {
        return this.findProviders(using, provider, exactMatch);
    };
    PublicTestability.prototype.findProviders = function (using, provider, exactMatch) {
        return this._testability.findBindings(using, provider, exactMatch);
    };
    return PublicTestability;
}());
var BrowserGetTestability = (function () {
    function BrowserGetTestability() {
    }
    BrowserGetTestability.prototype.addToWindow = function (registry) {
        lang_1.global.getAngularTestability = function (elem, findInAncestors) {
            if (findInAncestors === void 0) { findInAncestors = true; }
            var testability = registry.findTestabilityInTree(elem, findInAncestors);
            if (testability == null) {
                throw new Error('Could not find testability for element.');
            }
            return new PublicTestability(testability);
        };
        lang_1.global.getAllAngularTestabilities = function () {
            var testabilities = registry.getAllTestabilities();
            return testabilities.map(function (testability) { return new PublicTestability(testability); });
        };
        lang_1.global.getAllAngularRootElements = function () { return registry.getAllRootElements(); };
        var whenAllStable = function (callback) {
            var testabilities = lang_1.global.getAllAngularTestabilities();
            var count = testabilities.length;
            var didWork = false;
            var decrement = function (didWork_) {
                didWork = didWork || didWork_;
                count--;
                if (count == 0) {
                    callback(didWork);
                }
            };
            testabilities.forEach(function (testability) { testability.whenStable(decrement); });
        };
        if (!lang_1.global.frameworkStabilizers) {
            lang_1.global.frameworkStabilizers = collection_1.ListWrapper.createGrowableSize(0);
        }
        lang_1.global.frameworkStabilizers.push(whenAllStable);
    };
    BrowserGetTestability.prototype.findTestabilityInTree = function (registry, elem, findInAncestors) {
        if (elem == null) {
            return null;
        }
        var t = registry.getTestability(elem);
        if (lang_1.isPresent(t)) {
            return t;
        }
        else if (!findInAncestors) {
            return null;
        }
        if (dom_adapter_1.DOM.isShadowRoot(elem)) {
            return this.findTestabilityInTree(registry, dom_adapter_1.DOM.getHost(elem), true);
        }
        return this.findTestabilityInTree(registry, dom_adapter_1.DOM.parentElement(elem), true);
    };
    return BrowserGetTestability;
}());
exports.BrowserGetTestability = BrowserGetTestability;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGVzdGFiaWxpdHkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJkaWZmaW5nX3BsdWdpbl93cmFwcGVyLW91dHB1dF9wYXRoLWlnQTJzY21hLnRtcC9hbmd1bGFyMi9zcmMvcGxhdGZvcm0vYnJvd3Nlci90ZXN0YWJpbGl0eS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsMkJBQTJDLGdDQUFnQyxDQUFDLENBQUE7QUFDNUUscUJBQW1ELDBCQUEwQixDQUFDLENBQUE7QUFJOUUsNEJBQWtCLHVDQUF1QyxDQUFDLENBQUE7QUFTMUQ7SUFJRSwyQkFBWSxXQUF3QjtRQUFJLElBQUksQ0FBQyxZQUFZLEdBQUcsV0FBVyxDQUFDO0lBQUMsQ0FBQztJQUUxRSxvQ0FBUSxHQUFSLGNBQXNCLE1BQU0sQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUU1RCxzQ0FBVSxHQUFWLFVBQVcsUUFBa0IsSUFBSSxJQUFJLENBQUMsWUFBWSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFFMUUsd0NBQVksR0FBWixVQUFhLEtBQVUsRUFBRSxRQUFnQixFQUFFLFVBQW1CO1FBQzVELE1BQU0sQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLEtBQUssRUFBRSxRQUFRLEVBQUUsVUFBVSxDQUFDLENBQUM7SUFDekQsQ0FBQztJQUVELHlDQUFhLEdBQWIsVUFBYyxLQUFVLEVBQUUsUUFBZ0IsRUFBRSxVQUFtQjtRQUM3RCxNQUFNLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxZQUFZLENBQUMsS0FBSyxFQUFFLFFBQVEsRUFBRSxVQUFVLENBQUMsQ0FBQztJQUNyRSxDQUFDO0lBQ0gsd0JBQUM7QUFBRCxDQUFDLEFBakJELElBaUJDO0FBRUQ7SUFBQTtJQXFEQSxDQUFDO0lBcERDLDJDQUFXLEdBQVgsVUFBWSxRQUE2QjtRQUN2QyxhQUFNLENBQUMscUJBQXFCLEdBQUcsVUFBQyxJQUFTLEVBQUUsZUFBK0I7WUFBL0IsK0JBQStCLEdBQS9CLHNCQUErQjtZQUN4RSxJQUFJLFdBQVcsR0FBRyxRQUFRLENBQUMscUJBQXFCLENBQUMsSUFBSSxFQUFFLGVBQWUsQ0FBQyxDQUFDO1lBQ3hFLEVBQUUsQ0FBQyxDQUFDLFdBQVcsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDO2dCQUN4QixNQUFNLElBQUksS0FBSyxDQUFDLHlDQUF5QyxDQUFDLENBQUM7WUFDN0QsQ0FBQztZQUNELE1BQU0sQ0FBQyxJQUFJLGlCQUFpQixDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQzVDLENBQUMsQ0FBQztRQUVGLGFBQU0sQ0FBQywwQkFBMEIsR0FBRztZQUNsQyxJQUFJLGFBQWEsR0FBRyxRQUFRLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztZQUNuRCxNQUFNLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxVQUFDLFdBQVcsSUFBTyxNQUFNLENBQUMsSUFBSSxpQkFBaUIsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzVGLENBQUMsQ0FBQztRQUVGLGFBQU0sQ0FBQyx5QkFBeUIsR0FBRyxjQUFNLE9BQUEsUUFBUSxDQUFDLGtCQUFrQixFQUFFLEVBQTdCLENBQTZCLENBQUM7UUFFdkUsSUFBSSxhQUFhLEdBQUcsVUFBQyxRQUFRO1lBQzNCLElBQUksYUFBYSxHQUFHLGFBQU0sQ0FBQywwQkFBMEIsRUFBRSxDQUFDO1lBQ3hELElBQUksS0FBSyxHQUFHLGFBQWEsQ0FBQyxNQUFNLENBQUM7WUFDakMsSUFBSSxPQUFPLEdBQUcsS0FBSyxDQUFDO1lBQ3BCLElBQUksU0FBUyxHQUFHLFVBQVMsUUFBUTtnQkFDL0IsT0FBTyxHQUFHLE9BQU8sSUFBSSxRQUFRLENBQUM7Z0JBQzlCLEtBQUssRUFBRSxDQUFDO2dCQUNSLEVBQUUsQ0FBQyxDQUFDLEtBQUssSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUNmLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFDcEIsQ0FBQztZQUNILENBQUMsQ0FBQztZQUNGLGFBQWEsQ0FBQyxPQUFPLENBQUMsVUFBUyxXQUFXLElBQUksV0FBVyxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3RGLENBQUMsQ0FBQztRQUVGLEVBQUUsQ0FBQyxDQUFDLENBQUMsYUFBTSxDQUFDLG9CQUFvQixDQUFDLENBQUMsQ0FBQztZQUNqQyxhQUFNLENBQUMsb0JBQW9CLEdBQUcsd0JBQVcsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNsRSxDQUFDO1FBQ0QsYUFBTSxDQUFDLG9CQUFvQixDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztJQUNsRCxDQUFDO0lBRUQscURBQXFCLEdBQXJCLFVBQXNCLFFBQTZCLEVBQUUsSUFBUyxFQUN4QyxlQUF3QjtRQUM1QyxFQUFFLENBQUMsQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQztZQUNqQixNQUFNLENBQUMsSUFBSSxDQUFDO1FBQ2QsQ0FBQztRQUNELElBQUksQ0FBQyxHQUFHLFFBQVEsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDdEMsRUFBRSxDQUFDLENBQUMsZ0JBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDakIsTUFBTSxDQUFDLENBQUMsQ0FBQztRQUNYLENBQUM7UUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDO1lBQzVCLE1BQU0sQ0FBQyxJQUFJLENBQUM7UUFDZCxDQUFDO1FBQ0QsRUFBRSxDQUFDLENBQUMsaUJBQUcsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzNCLE1BQU0sQ0FBQyxJQUFJLENBQUMscUJBQXFCLENBQUMsUUFBUSxFQUFFLGlCQUFHLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ3ZFLENBQUM7UUFDRCxNQUFNLENBQUMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLFFBQVEsRUFBRSxpQkFBRyxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztJQUM3RSxDQUFDO0lBQ0gsNEJBQUM7QUFBRCxDQUFDLEFBckRELElBcURDO0FBckRZLDZCQUFxQix3QkFxRGpDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge01hcCwgTWFwV3JhcHBlciwgTGlzdFdyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvY29sbGVjdGlvbic7XG5pbXBvcnQge0NPTlNULCBDT05TVF9FWFBSLCBnbG9iYWwsIGlzUHJlc2VudH0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcbmltcG9ydCB7QmFzZUV4Y2VwdGlvbiwgV3JhcHBlZEV4Y2VwdGlvbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9leGNlcHRpb25zJztcbmltcG9ydCB7UHJvbWlzZVdyYXBwZXIsIE9ic2VydmFibGVXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2FzeW5jJztcblxuaW1wb3J0IHtET019IGZyb20gJ2FuZ3VsYXIyL3NyYy9wbGF0Zm9ybS9kb20vZG9tX2FkYXB0ZXInO1xuXG5pbXBvcnQge1xuICBJbmplY3RhYmxlLFxuICBUZXN0YWJpbGl0eVJlZ2lzdHJ5LFxuICBUZXN0YWJpbGl0eSxcbiAgR2V0VGVzdGFiaWxpdHksXG59IGZyb20gJ2FuZ3VsYXIyL2NvcmUnO1xuXG5jbGFzcyBQdWJsaWNUZXN0YWJpbGl0eSB7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3Rlc3RhYmlsaXR5OiBUZXN0YWJpbGl0eTtcblxuICBjb25zdHJ1Y3Rvcih0ZXN0YWJpbGl0eTogVGVzdGFiaWxpdHkpIHsgdGhpcy5fdGVzdGFiaWxpdHkgPSB0ZXN0YWJpbGl0eTsgfVxuXG4gIGlzU3RhYmxlKCk6IGJvb2xlYW4geyByZXR1cm4gdGhpcy5fdGVzdGFiaWxpdHkuaXNTdGFibGUoKTsgfVxuXG4gIHdoZW5TdGFibGUoY2FsbGJhY2s6IEZ1bmN0aW9uKSB7IHRoaXMuX3Rlc3RhYmlsaXR5LndoZW5TdGFibGUoY2FsbGJhY2spOyB9XG5cbiAgZmluZEJpbmRpbmdzKHVzaW5nOiBhbnksIHByb3ZpZGVyOiBzdHJpbmcsIGV4YWN0TWF0Y2g6IGJvb2xlYW4pOiBhbnlbXSB7XG4gICAgcmV0dXJuIHRoaXMuZmluZFByb3ZpZGVycyh1c2luZywgcHJvdmlkZXIsIGV4YWN0TWF0Y2gpO1xuICB9XG5cbiAgZmluZFByb3ZpZGVycyh1c2luZzogYW55LCBwcm92aWRlcjogc3RyaW5nLCBleGFjdE1hdGNoOiBib29sZWFuKTogYW55W10ge1xuICAgIHJldHVybiB0aGlzLl90ZXN0YWJpbGl0eS5maW5kQmluZGluZ3ModXNpbmcsIHByb3ZpZGVyLCBleGFjdE1hdGNoKTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgQnJvd3NlckdldFRlc3RhYmlsaXR5IGltcGxlbWVudHMgR2V0VGVzdGFiaWxpdHkge1xuICBhZGRUb1dpbmRvdyhyZWdpc3RyeTogVGVzdGFiaWxpdHlSZWdpc3RyeSk6IHZvaWQge1xuICAgIGdsb2JhbC5nZXRBbmd1bGFyVGVzdGFiaWxpdHkgPSAoZWxlbTogYW55LCBmaW5kSW5BbmNlc3RvcnM6IGJvb2xlYW4gPSB0cnVlKSA9PiB7XG4gICAgICB2YXIgdGVzdGFiaWxpdHkgPSByZWdpc3RyeS5maW5kVGVzdGFiaWxpdHlJblRyZWUoZWxlbSwgZmluZEluQW5jZXN0b3JzKTtcbiAgICAgIGlmICh0ZXN0YWJpbGl0eSA9PSBudWxsKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignQ291bGQgbm90IGZpbmQgdGVzdGFiaWxpdHkgZm9yIGVsZW1lbnQuJyk7XG4gICAgICB9XG4gICAgICByZXR1cm4gbmV3IFB1YmxpY1Rlc3RhYmlsaXR5KHRlc3RhYmlsaXR5KTtcbiAgICB9O1xuXG4gICAgZ2xvYmFsLmdldEFsbEFuZ3VsYXJUZXN0YWJpbGl0aWVzID0gKCkgPT4ge1xuICAgICAgdmFyIHRlc3RhYmlsaXRpZXMgPSByZWdpc3RyeS5nZXRBbGxUZXN0YWJpbGl0aWVzKCk7XG4gICAgICByZXR1cm4gdGVzdGFiaWxpdGllcy5tYXAoKHRlc3RhYmlsaXR5KSA9PiB7IHJldHVybiBuZXcgUHVibGljVGVzdGFiaWxpdHkodGVzdGFiaWxpdHkpOyB9KTtcbiAgICB9O1xuXG4gICAgZ2xvYmFsLmdldEFsbEFuZ3VsYXJSb290RWxlbWVudHMgPSAoKSA9PiByZWdpc3RyeS5nZXRBbGxSb290RWxlbWVudHMoKTtcblxuICAgIHZhciB3aGVuQWxsU3RhYmxlID0gKGNhbGxiYWNrKSA9PiB7XG4gICAgICB2YXIgdGVzdGFiaWxpdGllcyA9IGdsb2JhbC5nZXRBbGxBbmd1bGFyVGVzdGFiaWxpdGllcygpO1xuICAgICAgdmFyIGNvdW50ID0gdGVzdGFiaWxpdGllcy5sZW5ndGg7XG4gICAgICB2YXIgZGlkV29yayA9IGZhbHNlO1xuICAgICAgdmFyIGRlY3JlbWVudCA9IGZ1bmN0aW9uKGRpZFdvcmtfKSB7XG4gICAgICAgIGRpZFdvcmsgPSBkaWRXb3JrIHx8IGRpZFdvcmtfO1xuICAgICAgICBjb3VudC0tO1xuICAgICAgICBpZiAoY291bnQgPT0gMCkge1xuICAgICAgICAgIGNhbGxiYWNrKGRpZFdvcmspO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgICAgdGVzdGFiaWxpdGllcy5mb3JFYWNoKGZ1bmN0aW9uKHRlc3RhYmlsaXR5KSB7IHRlc3RhYmlsaXR5LndoZW5TdGFibGUoZGVjcmVtZW50KTsgfSk7XG4gICAgfTtcblxuICAgIGlmICghZ2xvYmFsLmZyYW1ld29ya1N0YWJpbGl6ZXJzKSB7XG4gICAgICBnbG9iYWwuZnJhbWV3b3JrU3RhYmlsaXplcnMgPSBMaXN0V3JhcHBlci5jcmVhdGVHcm93YWJsZVNpemUoMCk7XG4gICAgfVxuICAgIGdsb2JhbC5mcmFtZXdvcmtTdGFiaWxpemVycy5wdXNoKHdoZW5BbGxTdGFibGUpO1xuICB9XG5cbiAgZmluZFRlc3RhYmlsaXR5SW5UcmVlKHJlZ2lzdHJ5OiBUZXN0YWJpbGl0eVJlZ2lzdHJ5LCBlbGVtOiBhbnksXG4gICAgICAgICAgICAgICAgICAgICAgICBmaW5kSW5BbmNlc3RvcnM6IGJvb2xlYW4pOiBUZXN0YWJpbGl0eSB7XG4gICAgaWYgKGVsZW0gPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIHZhciB0ID0gcmVnaXN0cnkuZ2V0VGVzdGFiaWxpdHkoZWxlbSk7XG4gICAgaWYgKGlzUHJlc2VudCh0KSkge1xuICAgICAgcmV0dXJuIHQ7XG4gICAgfSBlbHNlIGlmICghZmluZEluQW5jZXN0b3JzKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgaWYgKERPTS5pc1NoYWRvd1Jvb3QoZWxlbSkpIHtcbiAgICAgIHJldHVybiB0aGlzLmZpbmRUZXN0YWJpbGl0eUluVHJlZShyZWdpc3RyeSwgRE9NLmdldEhvc3QoZWxlbSksIHRydWUpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5maW5kVGVzdGFiaWxpdHlJblRyZWUocmVnaXN0cnksIERPTS5wYXJlbnRFbGVtZW50KGVsZW0pLCB0cnVlKTtcbiAgfVxufVxuIl19