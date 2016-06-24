'use strict';"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var lang_1 = require('angular2/src/facade/lang');
var collection_1 = require('angular2/src/facade/collection');
var view_type_1 = require('./view_type');
var StaticNodeDebugInfo = (function () {
    function StaticNodeDebugInfo(providerTokens, componentToken, varTokens) {
        this.providerTokens = providerTokens;
        this.componentToken = componentToken;
        this.varTokens = varTokens;
    }
    StaticNodeDebugInfo = __decorate([
        lang_1.CONST(), 
        __metadata('design:paramtypes', [Array, Object, Object])
    ], StaticNodeDebugInfo);
    return StaticNodeDebugInfo;
}());
exports.StaticNodeDebugInfo = StaticNodeDebugInfo;
var DebugContext = (function () {
    function DebugContext(_view, _nodeIndex, _tplRow, _tplCol) {
        this._view = _view;
        this._nodeIndex = _nodeIndex;
        this._tplRow = _tplRow;
        this._tplCol = _tplCol;
    }
    Object.defineProperty(DebugContext.prototype, "_staticNodeInfo", {
        get: function () {
            return lang_1.isPresent(this._nodeIndex) ? this._view.staticNodeDebugInfos[this._nodeIndex] : null;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DebugContext.prototype, "context", {
        get: function () { return this._view.context; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DebugContext.prototype, "component", {
        get: function () {
            var staticNodeInfo = this._staticNodeInfo;
            if (lang_1.isPresent(staticNodeInfo) && lang_1.isPresent(staticNodeInfo.componentToken)) {
                return this.injector.get(staticNodeInfo.componentToken);
            }
            return null;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DebugContext.prototype, "componentRenderElement", {
        get: function () {
            var componentView = this._view;
            while (lang_1.isPresent(componentView.declarationAppElement) &&
                componentView.type !== view_type_1.ViewType.COMPONENT) {
                componentView = componentView.declarationAppElement.parentView;
            }
            return lang_1.isPresent(componentView.declarationAppElement) ?
                componentView.declarationAppElement.nativeElement :
                null;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DebugContext.prototype, "injector", {
        get: function () { return this._view.injector(this._nodeIndex); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DebugContext.prototype, "renderNode", {
        get: function () {
            if (lang_1.isPresent(this._nodeIndex) && lang_1.isPresent(this._view.allNodes)) {
                return this._view.allNodes[this._nodeIndex];
            }
            else {
                return null;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DebugContext.prototype, "providerTokens", {
        get: function () {
            var staticNodeInfo = this._staticNodeInfo;
            return lang_1.isPresent(staticNodeInfo) ? staticNodeInfo.providerTokens : null;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DebugContext.prototype, "source", {
        get: function () {
            return this._view.componentType.templateUrl + ":" + this._tplRow + ":" + this._tplCol;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DebugContext.prototype, "locals", {
        get: function () {
            var _this = this;
            var varValues = {};
            // TODO(tbosch): right now, the semantics of debugNode.locals are
            // that it contains the variables of all elements, not just
            // the given one. We preserve this for now to not have a breaking
            // change, but should change this later!
            collection_1.ListWrapper.forEachWithIndex(this._view.staticNodeDebugInfos, function (staticNodeInfo, nodeIndex) {
                var vars = staticNodeInfo.varTokens;
                collection_1.StringMapWrapper.forEach(vars, function (varToken, varName) {
                    var varValue;
                    if (lang_1.isBlank(varToken)) {
                        varValue = lang_1.isPresent(_this._view.allNodes) ? _this._view.allNodes[nodeIndex] : null;
                    }
                    else {
                        varValue = _this._view.injectorGet(varToken, nodeIndex, null);
                    }
                    varValues[varName] = varValue;
                });
            });
            collection_1.StringMapWrapper.forEach(this._view.locals, function (localValue, localName) { varValues[localName] = localValue; });
            return varValues;
        },
        enumerable: true,
        configurable: true
    });
    return DebugContext;
}());
exports.DebugContext = DebugContext;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVidWdfY29udGV4dC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRpZmZpbmdfcGx1Z2luX3dyYXBwZXItb3V0cHV0X3BhdGgtQU9hY21ZOFQudG1wL2FuZ3VsYXIyL3NyYy9jb3JlL2xpbmtlci9kZWJ1Z19jb250ZXh0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFBQSxxQkFBd0MsMEJBQTBCLENBQUMsQ0FBQTtBQUNuRSwyQkFBNEMsZ0NBQWdDLENBQUMsQ0FBQTtBQUk3RSwwQkFBdUIsYUFBYSxDQUFDLENBQUE7QUFHckM7SUFDRSw2QkFBbUIsY0FBcUIsRUFBUyxjQUFtQixFQUNqRCxTQUErQjtRQUQvQixtQkFBYyxHQUFkLGNBQWMsQ0FBTztRQUFTLG1CQUFjLEdBQWQsY0FBYyxDQUFLO1FBQ2pELGNBQVMsR0FBVCxTQUFTLENBQXNCO0lBQUcsQ0FBQztJQUh4RDtRQUFDLFlBQUssRUFBRTs7MkJBQUE7SUFJUiwwQkFBQztBQUFELENBQUMsQUFIRCxJQUdDO0FBSFksMkJBQW1CLHNCQUcvQixDQUFBO0FBRUQ7SUFDRSxzQkFBb0IsS0FBd0IsRUFBVSxVQUFrQixFQUFVLE9BQWUsRUFDN0UsT0FBZTtRQURmLFVBQUssR0FBTCxLQUFLLENBQW1CO1FBQVUsZUFBVSxHQUFWLFVBQVUsQ0FBUTtRQUFVLFlBQU8sR0FBUCxPQUFPLENBQVE7UUFDN0UsWUFBTyxHQUFQLE9BQU8sQ0FBUTtJQUFHLENBQUM7SUFFdkMsc0JBQVkseUNBQWU7YUFBM0I7WUFDRSxNQUFNLENBQUMsZ0JBQVMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsSUFBSSxDQUFDO1FBQzlGLENBQUM7OztPQUFBO0lBRUQsc0JBQUksaUNBQU87YUFBWCxjQUFnQixNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxD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Q0FBQyxHQUFHLElBQUksQ0FBQztvQkFDcEYsQ0FBQztvQkFBQyxJQUFJLENBQUMsQ0FBQzt3QkFDTixRQUFRLEdBQUcsS0FBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsUUFBUSxFQUFFLFNBQVMsRUFBRSxJQUFJLENBQUMsQ0FBQztvQkFDL0QsQ0FBQztvQkFDRCxTQUFTLENBQUMsT0FBTyxDQUFDLEdBQUcsUUFBUSxDQUFDO2dCQUNoQyxDQUFDLENBQUMsQ0FBQztZQUNMLENBQUMsQ0FBQyxDQUFDO1lBQ1AsNkJBQWdCLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxFQUNqQixVQUFDLFVBQVUsRUFBRSxTQUFTLElBQU8sU0FBUyxDQUFDLFNBQVMsQ0FBQyxHQUFHLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzVGLE1BQU0sQ0FBQyxTQUFTLENBQUM7UUFDbkIsQ0FBQzs7O09BQUE7SUFDSCxtQkFBQztBQUFELENBQUMsQUFqRUQsSUFpRUM7QUFqRVksb0JBQVksZUFpRXhCLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge2lzUHJlc2VudCwgaXNCbGFuaywgQ09OU1R9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge0xpc3RXcmFwcGVyLCBTdHJpbmdNYXBXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2NvbGxlY3Rpb24nO1xuaW1wb3J0IHtJbmplY3Rvcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvZGknO1xuaW1wb3J0IHtSZW5kZXJEZWJ1Z0luZm99IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL3JlbmRlci9hcGknO1xuaW1wb3J0IHtEZWJ1Z0FwcFZpZXd9IGZyb20gJy4vdmlldyc7XG5pbXBvcnQge1ZpZXdUeXBlfSBmcm9tICcuL3ZpZXdfdHlwZSc7XG5cbkBDT05TVCgpXG5leHBvcnQgY2xhc3MgU3RhdGljTm9kZURlYnVnSW5mbyB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBwcm92aWRlclRva2VuczogYW55W10sIHB1YmxpYyBjb21wb25lbnRUb2tlbjogYW55LFxuICAgICAgICAgICAgICBwdWJsaWMgdmFyVG9rZW5zOiB7W2tleTogc3RyaW5nXTogYW55fSkge31cbn1cblxuZXhwb3J0IGNsYXNzIERlYnVnQ29udGV4dCBpbXBsZW1lbnRzIFJlbmRlckRlYnVnSW5mbyB7XG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgX3ZpZXc6IERlYnVnQXBwVmlldzxhbnk+LCBwcml2YXRlIF9ub2RlSW5kZXg6IG51bWJlciwgcHJpdmF0ZSBfdHBsUm93OiBudW1iZXIsXG4gICAgICAgICAgICAgIHByaXZhdGUgX3RwbENvbDogbnVtYmVyKSB7fVxuXG4gIHByaXZhdGUgZ2V0IF9zdGF0aWNOb2RlSW5mbygpOiBTdGF0aWNOb2RlRGVidWdJbmZvIHtcbiAgICByZXR1cm4gaXNQcmVzZW50KHRoaXMuX25vZGVJbmRleCkgPyB0aGlzLl92aWV3LnN0YXRpY05vZGVEZWJ1Z0luZm9zW3RoaXMuX25vZGVJbmRleF0gOiBudWxsO1xuICB9XG5cbiAgZ2V0IGNvbnRleHQoKSB7IHJldHVybiB0aGlzLl92aWV3LmNvbnRleHQ7IH1cbiAgZ2V0IGNvbXBvbmVudCgpIHtcbiAgICB2YXIgc3RhdGljTm9kZUluZm8gPSB0aGlzLl9zdGF0aWNOb2RlSW5mbztcbiAgICBpZiAoaXNQcmVzZW50KHN0YXRpY05vZGVJbmZvKSAmJiBpc1ByZXNlbnQoc3RhdGljTm9kZUluZm8uY29tcG9uZW50VG9rZW4pKSB7XG4gICAgICByZXR1cm4gdGhpcy5pbmplY3Rvci5nZXQoc3RhdGljTm9kZUluZm8uY29tcG9uZW50VG9rZW4pO1xuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICBnZXQgY29tcG9uZW50UmVuZGVyRWxlbWVudCgpIHtcbiAgICB2YXIgY29tcG9uZW50VmlldyA9IHRoaXMuX3ZpZXc7XG4gICAgd2hpbGUgKGlzUHJlc2VudChjb21wb25lbnRWaWV3LmRlY2xhcmF0aW9uQXBwRWxlbWVudCkgJiZcbiAgICAgICAgICAgY29tcG9uZW50Vmlldy50eXBlICE9PSBWaWV3VHlwZS5DT01QT05FTlQpIHtcbiAgICAgIGNvbXBvbmVudFZpZXcgPSA8RGVidWdBcHBWaWV3PGFueT4+Y29tcG9uZW50Vmlldy5kZWNsYXJhdGlvbkFwcEVsZW1lbnQucGFyZW50VmlldztcbiAgICB9XG4gICAgcmV0dXJuIGlzUHJlc2VudChjb21wb25lbnRWaWV3LmRlY2xhcmF0aW9uQXBwRWxlbWVudCkgP1xuICAgICAgICAgICAgICAgY29tcG9uZW50Vmlldy5kZWNsYXJhdGlvbkFwcEVsZW1lbnQubmF0aXZlRWxlbWVudCA6XG4gICAgICAgICAgICAgICBudWxsO1xuICB9XG4gIGdldCBpbmplY3RvcigpOiBJbmplY3RvciB7IHJldHVybiB0aGlzLl92aWV3LmluamVjdG9yKHRoaXMuX25vZGVJbmRleCk7IH1cbiAgZ2V0IHJlbmRlck5vZGUoKTogYW55IHtcbiAgICBpZiAoaXNQcmVzZW50KHRoaXMuX25vZGVJbmRleCkgJiYgaXNQcmVzZW50KHRoaXMuX3ZpZXcuYWxsTm9kZXMpKSB7XG4gICAgICByZXR1cm4gdGhpcy5fdmlldy5hbGxOb2Rlc1t0aGlzLl9ub2RlSW5kZXhdO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gIH1cbiAgZ2V0IHByb3ZpZGVyVG9rZW5zKCk6IGFueVtdIHtcbiAgICB2YXIgc3RhdGljTm9kZUluZm8gPSB0aGlzLl9zdGF0aWNOb2RlSW5mbztcbiAgICByZXR1cm4gaXNQcmVzZW50KHN0YXRpY05vZGVJbmZvKSA/IHN0YXRpY05vZGVJbmZvLnByb3ZpZGVyVG9rZW5zIDogbnVsbDtcbiAgfVxuICBnZXQgc291cmNlKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGAke3RoaXMuX3ZpZXcuY29tcG9uZW50VHlwZS50ZW1wbGF0ZVVybH06JHt0aGlzLl90cGxSb3d9OiR7dGhpcy5fdHBsQ29sfWA7XG4gIH1cbiAgZ2V0IGxvY2FscygpOiB7W2tleTogc3RyaW5nXTogc3RyaW5nfSB7XG4gICAgdmFyIHZhclZhbHVlczoge1trZXk6IHN0cmluZ106IHN0cmluZ30gPSB7fTtcbiAgICAvLyBUT0RPKHRib3NjaCk6IHJpZ2h0IG5vdywgdGhlIHNlbWFudGljcyBvZiBkZWJ1Z05vZGUubG9jYWxzIGFyZVxuICAgIC8vIHRoYXQgaXQgY29udGFpbnMgdGhlIHZhcmlhYmxlcyBvZiBhbGwgZWxlbWVudHMsIG5vdCBqdXN0XG4gICAgLy8gdGhlIGdpdmVuIG9uZS4gV2UgcHJlc2VydmUgdGhpcyBmb3Igbm93IHRvIG5vdCBoYXZlIGEgYnJlYWtpbmdcbiAgICAvLyBjaGFuZ2UsIGJ1dCBzaG91bGQgY2hhbmdlIHRoaXMgbGF0ZXIhXG4gICAgTGlzdFdyYXBwZXIuZm9yRWFjaFdpdGhJbmRleChcbiAgICAgICAgdGhpcy5fdmlldy5zdGF0aWNOb2RlRGVidWdJbmZvcyxcbiAgICAgICAgKHN0YXRpY05vZGVJbmZvOiBTdGF0aWNOb2RlRGVidWdJbmZvLCBub2RlSW5kZXg6IG51bWJlcikgPT4ge1xuICAgICAgICAgIHZhciB2YXJzID0gc3RhdGljTm9kZUluZm8udmFyVG9rZW5zO1xuICAgICAgICAgIFN0cmluZ01hcFdyYXBwZXIuZm9yRWFjaCh2YXJzLCAodmFyVG9rZW4sIHZhck5hbWUpID0+IHtcbiAgICAgICAgICAgIHZhciB2YXJWYWx1ZTtcbiAgICAgICAgICAgIGlmIChpc0JsYW5rKHZhclRva2VuKSkge1xuICAgICAgICAgICAgICB2YXJWYWx1ZSA9IGlzUHJlc2VudCh0aGlzLl92aWV3LmFsbE5vZGVzKSA/IHRoaXMuX3ZpZXcuYWxsTm9kZXNbbm9kZUluZGV4XSA6IG51bGw7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICB2YXJWYWx1ZSA9IHRoaXMuX3ZpZXcuaW5qZWN0b3JHZXQodmFyVG9rZW4sIG5vZGVJbmRleCwgbnVsbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXJWYWx1ZXNbdmFyTmFtZV0gPSB2YXJWYWx1ZTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgU3RyaW5nTWFwV3JhcHBlci5mb3JFYWNoKHRoaXMuX3ZpZXcubG9jYWxzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAobG9jYWxWYWx1ZSwgbG9jYWxOYW1lKSA9PiB7IHZhclZhbHVlc1tsb2NhbE5hbWVdID0gbG9jYWxWYWx1ZTsgfSk7XG4gICAgcmV0dXJuIHZhclZhbHVlcztcbiAgfVxufVxuIl19