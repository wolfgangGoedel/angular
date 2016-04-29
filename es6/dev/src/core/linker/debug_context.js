var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { isPresent, isBlank, CONST } from 'angular2/src/facade/lang';
import { StringMapWrapper } from 'angular2/src/facade/collection';
import { ViewType } from './view_type';
export let StaticNodeDebugInfo = class StaticNodeDebugInfo {
    constructor(providerTokens, componentToken, refTokens) {
        this.providerTokens = providerTokens;
        this.componentToken = componentToken;
        this.refTokens = refTokens;
    }
};
StaticNodeDebugInfo = __decorate([
    CONST(), 
    __metadata('design:paramtypes', [Array, Object, Object])
], StaticNodeDebugInfo);
export class DebugContext {
    constructor(_view, _nodeIndex, _tplRow, _tplCol) {
        this._view = _view;
        this._nodeIndex = _nodeIndex;
        this._tplRow = _tplRow;
        this._tplCol = _tplCol;
    }
    get _staticNodeInfo() {
        return isPresent(this._nodeIndex) ? this._view.staticNodeDebugInfos[this._nodeIndex] : null;
    }
    get context() { return this._view.context; }
    get component() {
        var staticNodeInfo = this._staticNodeInfo;
        if (isPresent(staticNodeInfo) && isPresent(staticNodeInfo.componentToken)) {
            return this.injector.get(staticNodeInfo.componentToken);
        }
        return null;
    }
    get componentRenderElement() {
        var componentView = this._view;
        while (isPresent(componentView.declarationAppElement) &&
            componentView.type !== ViewType.COMPONENT) {
            componentView = componentView.declarationAppElement.parentView;
        }
        return isPresent(componentView.declarationAppElement) ?
            componentView.declarationAppElement.nativeElement :
            null;
    }
    get injector() { return this._view.injector(this._nodeIndex); }
    get renderNode() {
        if (isPresent(this._nodeIndex) && isPresent(this._view.allNodes)) {
            return this._view.allNodes[this._nodeIndex];
        }
        else {
            return null;
        }
    }
    get providerTokens() {
        var staticNodeInfo = this._staticNodeInfo;
        return isPresent(staticNodeInfo) ? staticNodeInfo.providerTokens : null;
    }
    get source() {
        return `${this._view.componentType.templateUrl}:${this._tplRow}:${this._tplCol}`;
    }
    get references() {
        var varValues = {};
        var staticNodeInfo = this._staticNodeInfo;
        if (isPresent(staticNodeInfo)) {
            var refs = staticNodeInfo.refTokens;
            StringMapWrapper.forEach(refs, (refToken, refName) => {
                var varValue;
                if (isBlank(refToken)) {
                    varValue = isPresent(this._view.allNodes) ? this._view.allNodes[this._nodeIndex] : null;
                }
                else {
                    varValue = this._view.injectorGet(refToken, this._nodeIndex, null);
                }
                varValues[refName] = varValue;
            });
        }
        return varValues;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVidWdfY29udGV4dC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRpZmZpbmdfcGx1Z2luX3dyYXBwZXItb3V0cHV0X3BhdGgtNTlDaGZobUQudG1wL2FuZ3VsYXIyL3NyYy9jb3JlL2xpbmtlci9kZWJ1Z19jb250ZXh0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztPQUFPLEVBQUMsU0FBUyxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUMsTUFBTSwwQkFBMEI7T0FDM0QsRUFBYyxnQkFBZ0IsRUFBQyxNQUFNLGdDQUFnQztPQUlyRSxFQUFDLFFBQVEsRUFBQyxNQUFNLGFBQWE7QUFHcEM7SUFDRSxZQUFtQixjQUFxQixFQUFTLGNBQW1CLEVBQ2pELFNBQStCO1FBRC9CLG1CQUFjLEdBQWQsY0FBYyxDQUFPO1FBQVMsbUJBQWMsR0FBZCxjQUFjLENBQUs7UUFDakQsY0FBUyxHQUFULFNBQVMsQ0FBc0I7SUFBRyxDQUFDO0FBQ3hELENBQUM7QUFKRDtJQUFDLEtBQUssRUFBRTs7dUJBQUE7QUFNUjtJQUNFLFlBQW9CLEtBQXdCLEVBQVUsVUFBa0IsRUFBVSxPQUFlLEVBQzdFLE9BQWU7UUFEZixVQUFLLEdBQUwsS0FBSyxDQUFtQjtRQUFVLGVBQVUsR0FBVixVQUFVLENBQVE7UUFBVSxZQUFPLEdBQVAsT0FBTyxDQUFRO1FBQzdFLFlBQU8sR0FBUCxPQUFPLENBQVE7SUFBRyxDQUFDO0lBRXZDLElBQVksZUFBZTtRQUN6QixNQUFNLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLG9CQUFvQixDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxJQUFJLENBQUM7SUFDOUYsQ0FBQztJQUVELElBQUksT0FBTyxLQUFLLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7SUFDNUMsSUFBSSxTQUFTO1FBQ1gsSUFBSSxjQUFjLEdBQUcs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QVEsQ0FBQztZQUNoQyxDQUFDLENBQUMsQ0FBQztRQUNMLENBQUM7UUFDRCxNQUFNLENBQUMsU0FBUyxDQUFDO0lBQ25CLENBQUM7QUFDSCxDQUFDO0FBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge2lzUHJlc2VudCwgaXNCbGFuaywgQ09OU1R9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge0xpc3RXcmFwcGVyLCBTdHJpbmdNYXBXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2NvbGxlY3Rpb24nO1xuaW1wb3J0IHtJbmplY3Rvcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvZGknO1xuaW1wb3J0IHtSZW5kZXJEZWJ1Z0luZm99IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL3JlbmRlci9hcGknO1xuaW1wb3J0IHtEZWJ1Z0FwcFZpZXd9IGZyb20gJy4vdmlldyc7XG5pbXBvcnQge1ZpZXdUeXBlfSBmcm9tICcuL3ZpZXdfdHlwZSc7XG5cbkBDT05TVCgpXG5leHBvcnQgY2xhc3MgU3RhdGljTm9kZURlYnVnSW5mbyB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBwcm92aWRlclRva2VuczogYW55W10sIHB1YmxpYyBjb21wb25lbnRUb2tlbjogYW55LFxuICAgICAgICAgICAgICBwdWJsaWMgcmVmVG9rZW5zOiB7W2tleTogc3RyaW5nXTogYW55fSkge31cbn1cblxuZXhwb3J0IGNsYXNzIERlYnVnQ29udGV4dCBpbXBsZW1lbnRzIFJlbmRlckRlYnVnSW5mbyB7XG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgX3ZpZXc6IERlYnVnQXBwVmlldzxhbnk+LCBwcml2YXRlIF9ub2RlSW5kZXg6IG51bWJlciwgcHJpdmF0ZSBfdHBsUm93OiBudW1iZXIsXG4gICAgICAgICAgICAgIHByaXZhdGUgX3RwbENvbDogbnVtYmVyKSB7fVxuXG4gIHByaXZhdGUgZ2V0IF9zdGF0aWNOb2RlSW5mbygpOiBTdGF0aWNOb2RlRGVidWdJbmZvIHtcbiAgICByZXR1cm4gaXNQcmVzZW50KHRoaXMuX25vZGVJbmRleCkgPyB0aGlzLl92aWV3LnN0YXRpY05vZGVEZWJ1Z0luZm9zW3RoaXMuX25vZGVJbmRleF0gOiBudWxsO1xuICB9XG5cbiAgZ2V0IGNvbnRleHQoKSB7IHJldHVybiB0aGlzLl92aWV3LmNvbnRleHQ7IH1cbiAgZ2V0IGNvbXBvbmVudCgpIHtcbiAgICB2YXIgc3RhdGljTm9kZUluZm8gPSB0aGlzLl9zdGF0aWNOb2RlSW5mbztcbiAgICBpZiAoaXNQcmVzZW50KHN0YXRpY05vZGVJbmZvKSAmJiBpc1ByZXNlbnQoc3RhdGljTm9kZUluZm8uY29tcG9uZW50VG9rZW4pKSB7XG4gICAgICByZXR1cm4gdGhpcy5pbmplY3Rvci5nZXQoc3RhdGljTm9kZUluZm8uY29tcG9uZW50VG9rZW4pO1xuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICBnZXQgY29tcG9uZW50UmVuZGVyRWxlbWVudCgpIHtcbiAgICB2YXIgY29tcG9uZW50VmlldyA9IHRoaXMuX3ZpZXc7XG4gICAgd2hpbGUgKGlzUHJlc2VudChjb21wb25lbnRWaWV3LmRlY2xhcmF0aW9uQXBwRWxlbWVudCkgJiZcbiAgICAgICAgICAgY29tcG9uZW50Vmlldy50eXBlICE9PSBWaWV3VHlwZS5DT01QT05FTlQpIHtcbiAgICAgIGNvbXBvbmVudFZpZXcgPSA8RGVidWdBcHBWaWV3PGFueT4+Y29tcG9uZW50Vmlldy5kZWNsYXJhdGlvbkFwcEVsZW1lbnQucGFyZW50VmlldztcbiAgICB9XG4gICAgcmV0dXJuIGlzUHJlc2VudChjb21wb25lbnRWaWV3LmRlY2xhcmF0aW9uQXBwRWxlbWVudCkgP1xuICAgICAgICAgICAgICAgY29tcG9uZW50Vmlldy5kZWNsYXJhdGlvbkFwcEVsZW1lbnQubmF0aXZlRWxlbWVudCA6XG4gICAgICAgICAgICAgICBudWxsO1xuICB9XG4gIGdldCBpbmplY3RvcigpOiBJbmplY3RvciB7IHJldHVybiB0aGlzLl92aWV3LmluamVjdG9yKHRoaXMuX25vZGVJbmRleCk7IH1cbiAgZ2V0IHJlbmRlck5vZGUoKTogYW55IHtcbiAgICBpZiAoaXNQcmVzZW50KHRoaXMuX25vZGVJbmRleCkgJiYgaXNQcmVzZW50KHRoaXMuX3ZpZXcuYWxsTm9kZXMpKSB7XG4gICAgICByZXR1cm4gdGhpcy5fdmlldy5hbGxOb2Rlc1t0aGlzLl9ub2RlSW5kZXhdO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gIH1cbiAgZ2V0IHByb3ZpZGVyVG9rZW5zKCk6IGFueVtdIHtcbiAgICB2YXIgc3RhdGljTm9kZUluZm8gPSB0aGlzLl9zdGF0aWNOb2RlSW5mbztcbiAgICByZXR1cm4gaXNQcmVzZW50KHN0YXRpY05vZGVJbmZvKSA/IHN0YXRpY05vZGVJbmZvLnByb3ZpZGVyVG9rZW5zIDogbnVsbDtcbiAgfVxuICBnZXQgc291cmNlKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGAke3RoaXMuX3ZpZXcuY29tcG9uZW50VHlwZS50ZW1wbGF0ZVVybH06JHt0aGlzLl90cGxSb3d9OiR7dGhpcy5fdHBsQ29sfWA7XG4gIH1cbiAgZ2V0IHJlZmVyZW5jZXMoKToge1trZXk6IHN0cmluZ106IGFueX0ge1xuICAgIHZhciB2YXJWYWx1ZXM6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9ID0ge307XG4gICAgdmFyIHN0YXRpY05vZGVJbmZvID0gdGhpcy5fc3RhdGljTm9kZUluZm87XG4gICAgaWYgKGlzUHJlc2VudChzdGF0aWNOb2RlSW5mbykpIHtcbiAgICAgIHZhciByZWZzID0gc3RhdGljTm9kZUluZm8ucmVmVG9rZW5zO1xuICAgICAgU3RyaW5nTWFwV3JhcHBlci5mb3JFYWNoKHJlZnMsIChyZWZUb2tlbiwgcmVmTmFtZSkgPT4ge1xuICAgICAgICB2YXIgdmFyVmFsdWU7XG4gICAgICAgIGlmIChpc0JsYW5rKHJlZlRva2VuKSkge1xuICAgICAgICAgIHZhclZhbHVlID0gaXNQcmVzZW50KHRoaXMuX3ZpZXcuYWxsTm9kZXMpID8gdGhpcy5fdmlldy5hbGxOb2Rlc1t0aGlzLl9ub2RlSW5kZXhdIDogbnVsbDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB2YXJWYWx1ZSA9IHRoaXMuX3ZpZXcuaW5qZWN0b3JHZXQocmVmVG9rZW4sIHRoaXMuX25vZGVJbmRleCwgbnVsbCk7XG4gICAgICAgIH1cbiAgICAgICAgdmFyVmFsdWVzW3JlZk5hbWVdID0gdmFyVmFsdWU7XG4gICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIHZhclZhbHVlcztcbiAgfVxufVxuIl19