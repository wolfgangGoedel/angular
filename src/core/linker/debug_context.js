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
    function StaticNodeDebugInfo(providerTokens, componentToken, refTokens) {
        this.providerTokens = providerTokens;
        this.componentToken = componentToken;
        this.refTokens = refTokens;
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
    Object.defineProperty(DebugContext.prototype, "references", {
        get: function () {
            var _this = this;
            var varValues = {};
            var staticNodeInfo = this._staticNodeInfo;
            if (lang_1.isPresent(staticNodeInfo)) {
                var refs = staticNodeInfo.refTokens;
                collection_1.StringMapWrapper.forEach(refs, function (refToken, refName) {
                    var varValue;
                    if (lang_1.isBlank(refToken)) {
                        varValue = lang_1.isPresent(_this._view.allNodes) ? _this._view.allNodes[_this._nodeIndex] : null;
                    }
                    else {
                        varValue = _this._view.injectorGet(refToken, _this._nodeIndex, null);
                    }
                    varValues[refName] = varValue;
                });
            }
            return varValues;
        },
        enumerable: true,
        configurable: true
    });
    return DebugContext;
}());
exports.DebugContext = DebugContext;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVidWdfY29udGV4dC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRpZmZpbmdfcGx1Z2luX3dyYXBwZXItb3V0cHV0X3BhdGgtVzVWZ0tuQkYudG1wL2FuZ3VsYXIyL3NyYy9jb3JlL2xpbmtlci9kZWJ1Z19jb250ZXh0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFBQSxxQkFBd0MsMEJBQTBCLENBQUMsQ0FBQTtBQUNuRSwyQkFBNEMsZ0NBQWdDLENBQUMsQ0FBQTtBQUk3RSwwQkFBdUIsYUFBYSxDQUFDLENBQUE7QUFHckM7SUFDRSw2QkFBbUIsY0FBcUIsRUFBUyxjQUFtQixFQUNqRCxTQUErQjtRQUQvQixtQkFBYyxHQUFkLGNBQWMsQ0FBTztRQUFTLG1CQUFjLEdBQWQsY0FBYyxDQUFLO1FBQ2pELGNBQVMsR0FBVCxTQUFTLENBQXNCO0lBQUcsQ0FBQztJQUh4RDtRQUFDLFlBQUssRUFBRTs7MkJBQUE7SUFJUiwwQkFBQztBQUFELENBQUMsQUFIRCxJQUdDO0FBSFksMkJBQW1CLHNCQUcvQixDQUFBO0FBRUQ7SUFDRSxzQkFBb0IsS0FBd0IsRUFBVSxVQUFrQixFQUFVLE9BQWUsRUFDN0UsT0FBZTtRQURmLFVBQUssR0FBTCxLQUFLLENBQW1CO1FBQVUsZUFBVSxHQUFWLFVBQVUsQ0FBUTtRQUFVLFlBQU8sR0FBUCxPQUFPLENBQVE7UUFDN0UsWUFBTyxHQUFQLE9BQU8sQ0FBUTtJQUFHLENBQUM7SUFFdkMsc0JBQVkseUNBQWU7YUFBM0I7WUFDRSxNQUFNLENBQUMsZ0JBQVMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsSUFBSSxDQUFDO1FBQzlGLENBQUM7OztPQUFBO0lBRUQsc0JBQUksaUNBQU87YUFBWCxjQUFnQixNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxD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QztvQkFBQyxJQUFJLENBQUMsQ0FBQzt3QkFDTixRQUFRLEdBQUcsS0FBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUMsUUFBUSxFQUFFLEtBQUksQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLENBQUM7b0JBQ3JFLENBQUM7b0JBQ0QsU0FBUyxDQUFDLE9BQU8sQ0FBQyxHQUFHLFFBQVEsQ0FBQztnQkFDaEMsQ0FBQyxDQUFDLENBQUM7WUFDTCxDQUFDO1lBQ0QsTUFBTSxDQUFDLFNBQVMsQ0FBQztRQUNuQixDQUFDOzs7T0FBQTtJQUNILG1CQUFDO0FBQUQsQ0FBQyxBQTFERCxJQTBEQztBQTFEWSxvQkFBWSxlQTBEeEIsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7aXNQcmVzZW50LCBpc0JsYW5rLCBDT05TVH0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcbmltcG9ydCB7TGlzdFdyYXBwZXIsIFN0cmluZ01hcFdyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvY29sbGVjdGlvbic7XG5pbXBvcnQge0luamVjdG9yfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9kaSc7XG5pbXBvcnQge1JlbmRlckRlYnVnSW5mb30gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvcmVuZGVyL2FwaSc7XG5pbXBvcnQge0RlYnVnQXBwVmlld30gZnJvbSAnLi92aWV3JztcbmltcG9ydCB7Vmlld1R5cGV9IGZyb20gJy4vdmlld190eXBlJztcblxuQENPTlNUKClcbmV4cG9ydCBjbGFzcyBTdGF0aWNOb2RlRGVidWdJbmZvIHtcbiAgY29uc3RydWN0b3IocHVibGljIHByb3ZpZGVyVG9rZW5zOiBhbnlbXSwgcHVibGljIGNvbXBvbmVudFRva2VuOiBhbnksXG4gICAgICAgICAgICAgIHB1YmxpYyByZWZUb2tlbnM6IHtba2V5OiBzdHJpbmddOiBhbnl9KSB7fVxufVxuXG5leHBvcnQgY2xhc3MgRGVidWdDb250ZXh0IGltcGxlbWVudHMgUmVuZGVyRGVidWdJbmZvIHtcbiAgY29uc3RydWN0b3IocHJpdmF0ZSBfdmlldzogRGVidWdBcHBWaWV3PGFueT4sIHByaXZhdGUgX25vZGVJbmRleDogbnVtYmVyLCBwcml2YXRlIF90cGxSb3c6IG51bWJlcixcbiAgICAgICAgICAgICAgcHJpdmF0ZSBfdHBsQ29sOiBudW1iZXIpIHt9XG5cbiAgcHJpdmF0ZSBnZXQgX3N0YXRpY05vZGVJbmZvKCk6IFN0YXRpY05vZGVEZWJ1Z0luZm8ge1xuICAgIHJldHVybiBpc1ByZXNlbnQodGhpcy5fbm9kZUluZGV4KSA/IHRoaXMuX3ZpZXcuc3RhdGljTm9kZURlYnVnSW5mb3NbdGhpcy5fbm9kZUluZGV4XSA6IG51bGw7XG4gIH1cblxuICBnZXQgY29udGV4dCgpIHsgcmV0dXJuIHRoaXMuX3ZpZXcuY29udGV4dDsgfVxuICBnZXQgY29tcG9uZW50KCkge1xuICAgIHZhciBzdGF0aWNOb2RlSW5mbyA9IHRoaXMuX3N0YXRpY05vZGVJbmZvO1xuICAgIGlmIChpc1ByZXNlbnQoc3RhdGljTm9kZUluZm8pICYmIGlzUHJlc2VudChzdGF0aWNOb2RlSW5mby5jb21wb25lbnRUb2tlbikpIHtcbiAgICAgIHJldHVybiB0aGlzLmluamVjdG9yLmdldChzdGF0aWNOb2RlSW5mby5jb21wb25lbnRUb2tlbik7XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xuICB9XG4gIGdldCBjb21wb25lbnRSZW5kZXJFbGVtZW50KCkge1xuICAgIHZhciBjb21wb25lbnRWaWV3ID0gdGhpcy5fdmlldztcbiAgICB3aGlsZSAoaXNQcmVzZW50KGNvbXBvbmVudFZpZXcuZGVjbGFyYXRpb25BcHBFbGVtZW50KSAmJlxuICAgICAgICAgICBjb21wb25lbnRWaWV3LnR5cGUgIT09IFZpZXdUeXBlLkNPTVBPTkVOVCkge1xuICAgICAgY29tcG9uZW50VmlldyA9IDxEZWJ1Z0FwcFZpZXc8YW55Pj5jb21wb25lbnRWaWV3LmRlY2xhcmF0aW9uQXBwRWxlbWVudC5wYXJlbnRWaWV3O1xuICAgIH1cbiAgICByZXR1cm4gaXNQcmVzZW50KGNvbXBvbmVudFZpZXcuZGVjbGFyYXRpb25BcHBFbGVtZW50KSA/XG4gICAgICAgICAgICAgICBjb21wb25lbnRWaWV3LmRlY2xhcmF0aW9uQXBwRWxlbWVudC5uYXRpdmVFbGVtZW50IDpcbiAgICAgICAgICAgICAgIG51bGw7XG4gIH1cbiAgZ2V0IGluamVjdG9yKCk6IEluamVjdG9yIHsgcmV0dXJuIHRoaXMuX3ZpZXcuaW5qZWN0b3IodGhpcy5fbm9kZUluZGV4KTsgfVxuICBnZXQgcmVuZGVyTm9kZSgpOiBhbnkge1xuICAgIGlmIChpc1ByZXNlbnQodGhpcy5fbm9kZUluZGV4KSAmJiBpc1ByZXNlbnQodGhpcy5fdmlldy5hbGxOb2RlcykpIHtcbiAgICAgIHJldHVybiB0aGlzLl92aWV3LmFsbE5vZGVzW3RoaXMuX25vZGVJbmRleF07XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgfVxuICBnZXQgcHJvdmlkZXJUb2tlbnMoKTogYW55W10ge1xuICAgIHZhciBzdGF0aWNOb2RlSW5mbyA9IHRoaXMuX3N0YXRpY05vZGVJbmZvO1xuICAgIHJldHVybiBpc1ByZXNlbnQoc3RhdGljTm9kZUluZm8pID8gc3RhdGljTm9kZUluZm8ucHJvdmlkZXJUb2tlbnMgOiBudWxsO1xuICB9XG4gIGdldCBzb3VyY2UoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gYCR7dGhpcy5fdmlldy5jb21wb25lbnRUeXBlLnRlbXBsYXRlVXJsfToke3RoaXMuX3RwbFJvd306JHt0aGlzLl90cGxDb2x9YDtcbiAgfVxuICBnZXQgcmVmZXJlbmNlcygpOiB7W2tleTogc3RyaW5nXTogYW55fSB7XG4gICAgdmFyIHZhclZhbHVlczoge1trZXk6IHN0cmluZ106IHN0cmluZ30gPSB7fTtcbiAgICB2YXIgc3RhdGljTm9kZUluZm8gPSB0aGlzLl9zdGF0aWNOb2RlSW5mbztcbiAgICBpZiAoaXNQcmVzZW50KHN0YXRpY05vZGVJbmZvKSkge1xuICAgICAgdmFyIHJlZnMgPSBzdGF0aWNOb2RlSW5mby5yZWZUb2tlbnM7XG4gICAgICBTdHJpbmdNYXBXcmFwcGVyLmZvckVhY2gocmVmcywgKHJlZlRva2VuLCByZWZOYW1lKSA9PiB7XG4gICAgICAgIHZhciB2YXJWYWx1ZTtcbiAgICAgICAgaWYgKGlzQmxhbmsocmVmVG9rZW4pKSB7XG4gICAgICAgICAgdmFyVmFsdWUgPSBpc1ByZXNlbnQodGhpcy5fdmlldy5hbGxOb2RlcykgPyB0aGlzLl92aWV3LmFsbE5vZGVzW3RoaXMuX25vZGVJbmRleF0gOiBudWxsO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHZhclZhbHVlID0gdGhpcy5fdmlldy5pbmplY3RvckdldChyZWZUb2tlbiwgdGhpcy5fbm9kZUluZGV4LCBudWxsKTtcbiAgICAgICAgfVxuICAgICAgICB2YXJWYWx1ZXNbcmVmTmFtZV0gPSB2YXJWYWx1ZTtcbiAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4gdmFyVmFsdWVzO1xuICB9XG59XG4iXX0=