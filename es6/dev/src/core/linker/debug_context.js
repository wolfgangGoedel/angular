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
import { ListWrapper, StringMapWrapper } from 'angular2/src/facade/collection';
import { ViewType } from './view_type';
export let StaticNodeDebugInfo = class StaticNodeDebugInfo {
    constructor(providerTokens, componentToken, varTokens) {
        this.providerTokens = providerTokens;
        this.componentToken = componentToken;
        this.varTokens = varTokens;
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
    get locals() {
        var varValues = {};
        // TODO(tbosch): right now, the semantics of debugNode.locals are
        // that it contains the variables of all elements, not just
        // the given one. We preserve this for now to not have a breaking
        // change, but should change this later!
        ListWrapper.forEachWithIndex(this._view.staticNodeDebugInfos, (staticNodeInfo, nodeIndex) => {
            var vars = staticNodeInfo.varTokens;
            StringMapWrapper.forEach(vars, (varToken, varName) => {
                var varValue;
                if (isBlank(varToken)) {
                    varValue = isPresent(this._view.allNodes) ? this._view.allNodes[nodeIndex] : null;
                }
                else {
                    varValue = this._view.injectorGet(varToken, nodeIndex, null);
                }
                varValues[varName] = varValue;
            });
        });
        StringMapWrapper.forEach(this._view.locals, (localValue, localName) => { varValues[localName] = localValue; });
        return varValues;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVidWdfY29udGV4dC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRpZmZpbmdfcGx1Z2luX3dyYXBwZXItb3V0cHV0X3BhdGgtc200NmxFNHQudG1wL2FuZ3VsYXIyL3NyYy9jb3JlL2xpbmtlci9kZWJ1Z19jb250ZXh0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztPQUFPLEVBQUMsU0FBUyxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUMsTUFBTSwwQkFBMEI7T0FDM0QsRUFBQyxXQUFXLEVBQUUsZ0JBQWdCLEVBQUMsTUFBTSxnQ0FBZ0M7T0FJckUsRUFBQyxRQUFRLEVBQUMsTUFBTSxhQUFhO0FBR3BDO0lBQ0UsWUFBbUIsY0FBcUIsRUFBUyxjQUFtQixFQUNqRCxTQUErQjtRQUQvQixtQkFBYyxHQUFkLGNBQWMsQ0FBTztRQUFTLG1CQUFjLEdBQWQsY0FBYyxDQUFLO1FBQ2pELGNBQVMsR0FBVCxTQUFTLENBQXNCO0lBQUcsQ0FBQztBQUN4RCxDQUFDO0FBSkQ7SUFBQyxLQUFLLEVBQUU7O3VCQUFBO0FBTVI7SUFDRSxZQUFvQixLQUF3QixFQUFVLFVBQWtCLEVBQVUsT0FBZSxFQUM3RSxPQUFlO1FBRGYsVUFBSyxHQUFMLEtBQUssQ0FBbUI7UUFBVSxlQUFVLEdBQVYsVUFBVSxDQUFRO1FBQVUsWUFBTyxHQUFQLE9BQU8sQ0FBUTtRQUM3RSxZQUFPLEdBQVAsT0FBTyxDQUFRO0lBQUcsQ0FBQztJQUV2QyxJQUFZLGVBQWU7UUFDekIsTUFBTSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsSUFBSSxDQUFDO0lBQzlGLENBQUM7SUFFRCxJQUFJLE9BQU8sS0FBSyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO0lBQzVDLElBQUksU0FBUztRQUNYLElBQUks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RCxTQUFTLENBQUMsT0FBTyxDQUFDLEdBQUcsUUFBUSxDQUFDO1lBQ2hDLENBQUMsQ0FBQyxDQUFDO1FBQ0wsQ0FBQyxDQUFDLENBQUM7UUFDUCxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQ2pCLENBQUMsVUFBVSxFQUFFLFNBQVMsT0FBTyxTQUFTLENBQUMsU0FBUyxDQUFDLEdBQUcsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDNUYsTUFBTSxDQUFDLFNBQVMsQ0FBQztJQUNuQixDQUFDO0FBQ0gsQ0FBQztBQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtpc1ByZXNlbnQsIGlzQmxhbmssIENPTlNUfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtMaXN0V3JhcHBlciwgU3RyaW5nTWFwV3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9jb2xsZWN0aW9uJztcbmltcG9ydCB7SW5qZWN0b3J9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2RpJztcbmltcG9ydCB7UmVuZGVyRGVidWdJbmZvfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9yZW5kZXIvYXBpJztcbmltcG9ydCB7RGVidWdBcHBWaWV3fSBmcm9tICcuL3ZpZXcnO1xuaW1wb3J0IHtWaWV3VHlwZX0gZnJvbSAnLi92aWV3X3R5cGUnO1xuXG5AQ09OU1QoKVxuZXhwb3J0IGNsYXNzIFN0YXRpY05vZGVEZWJ1Z0luZm8ge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgcHJvdmlkZXJUb2tlbnM6IGFueVtdLCBwdWJsaWMgY29tcG9uZW50VG9rZW46IGFueSxcbiAgICAgICAgICAgICAgcHVibGljIHZhclRva2Vuczoge1trZXk6IHN0cmluZ106IGFueX0pIHt9XG59XG5cbmV4cG9ydCBjbGFzcyBEZWJ1Z0NvbnRleHQgaW1wbGVtZW50cyBSZW5kZXJEZWJ1Z0luZm8ge1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIF92aWV3OiBEZWJ1Z0FwcFZpZXc8YW55PiwgcHJpdmF0ZSBfbm9kZUluZGV4OiBudW1iZXIsIHByaXZhdGUgX3RwbFJvdzogbnVtYmVyLFxuICAgICAgICAgICAgICBwcml2YXRlIF90cGxDb2w6IG51bWJlcikge31cblxuICBwcml2YXRlIGdldCBfc3RhdGljTm9kZUluZm8oKTogU3RhdGljTm9kZURlYnVnSW5mbyB7XG4gICAgcmV0dXJuIGlzUHJlc2VudCh0aGlzLl9ub2RlSW5kZXgpID8gdGhpcy5fdmlldy5zdGF0aWNOb2RlRGVidWdJbmZvc1t0aGlzLl9ub2RlSW5kZXhdIDogbnVsbDtcbiAgfVxuXG4gIGdldCBjb250ZXh0KCkgeyByZXR1cm4gdGhpcy5fdmlldy5jb250ZXh0OyB9XG4gIGdldCBjb21wb25lbnQoKSB7XG4gICAgdmFyIHN0YXRpY05vZGVJbmZvID0gdGhpcy5fc3RhdGljTm9kZUluZm87XG4gICAgaWYgKGlzUHJlc2VudChzdGF0aWNOb2RlSW5mbykgJiYgaXNQcmVzZW50KHN0YXRpY05vZGVJbmZvLmNvbXBvbmVudFRva2VuKSkge1xuICAgICAgcmV0dXJuIHRoaXMuaW5qZWN0b3IuZ2V0KHN0YXRpY05vZGVJbmZvLmNvbXBvbmVudFRva2VuKTtcbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgZ2V0IGNvbXBvbmVudFJlbmRlckVsZW1lbnQoKSB7XG4gICAgdmFyIGNvbXBvbmVudFZpZXcgPSB0aGlzLl92aWV3O1xuICAgIHdoaWxlIChpc1ByZXNlbnQoY29tcG9uZW50Vmlldy5kZWNsYXJhdGlvbkFwcEVsZW1lbnQpICYmXG4gICAgICAgICAgIGNvbXBvbmVudFZpZXcudHlwZSAhPT0gVmlld1R5cGUuQ09NUE9ORU5UKSB7XG4gICAgICBjb21wb25lbnRWaWV3ID0gPERlYnVnQXBwVmlldzxhbnk+PmNvbXBvbmVudFZpZXcuZGVjbGFyYXRpb25BcHBFbGVtZW50LnBhcmVudFZpZXc7XG4gICAgfVxuICAgIHJldHVybiBpc1ByZXNlbnQoY29tcG9uZW50Vmlldy5kZWNsYXJhdGlvbkFwcEVsZW1lbnQpID9cbiAgICAgICAgICAgICAgIGNvbXBvbmVudFZpZXcuZGVjbGFyYXRpb25BcHBFbGVtZW50Lm5hdGl2ZUVsZW1lbnQgOlxuICAgICAgICAgICAgICAgbnVsbDtcbiAgfVxuICBnZXQgaW5qZWN0b3IoKTogSW5qZWN0b3IgeyByZXR1cm4gdGhpcy5fdmlldy5pbmplY3Rvcih0aGlzLl9ub2RlSW5kZXgpOyB9XG4gIGdldCByZW5kZXJOb2RlKCk6IGFueSB7XG4gICAgaWYgKGlzUHJlc2VudCh0aGlzLl9ub2RlSW5kZXgpICYmIGlzUHJlc2VudCh0aGlzLl92aWV3LmFsbE5vZGVzKSkge1xuICAgICAgcmV0dXJuIHRoaXMuX3ZpZXcuYWxsTm9kZXNbdGhpcy5fbm9kZUluZGV4XTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICB9XG4gIGdldCBwcm92aWRlclRva2VucygpOiBhbnlbXSB7XG4gICAgdmFyIHN0YXRpY05vZGVJbmZvID0gdGhpcy5fc3RhdGljTm9kZUluZm87XG4gICAgcmV0dXJuIGlzUHJlc2VudChzdGF0aWNOb2RlSW5mbykgPyBzdGF0aWNOb2RlSW5mby5wcm92aWRlclRva2VucyA6IG51bGw7XG4gIH1cbiAgZ2V0IHNvdXJjZSgpOiBzdHJpbmcge1xuICAgIHJldHVybiBgJHt0aGlzLl92aWV3LmNvbXBvbmVudFR5cGUudGVtcGxhdGVVcmx9OiR7dGhpcy5fdHBsUm93fToke3RoaXMuX3RwbENvbH1gO1xuICB9XG4gIGdldCBsb2NhbHMoKToge1trZXk6IHN0cmluZ106IHN0cmluZ30ge1xuICAgIHZhciB2YXJWYWx1ZXM6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9ID0ge307XG4gICAgLy8gVE9ETyh0Ym9zY2gpOiByaWdodCBub3csIHRoZSBzZW1hbnRpY3Mgb2YgZGVidWdOb2RlLmxvY2FscyBhcmVcbiAgICAvLyB0aGF0IGl0IGNvbnRhaW5zIHRoZSB2YXJpYWJsZXMgb2YgYWxsIGVsZW1lbnRzLCBub3QganVzdFxuICAgIC8vIHRoZSBnaXZlbiBvbmUuIFdlIHByZXNlcnZlIHRoaXMgZm9yIG5vdyB0byBub3QgaGF2ZSBhIGJyZWFraW5nXG4gICAgLy8gY2hhbmdlLCBidXQgc2hvdWxkIGNoYW5nZSB0aGlzIGxhdGVyIVxuICAgIExpc3RXcmFwcGVyLmZvckVhY2hXaXRoSW5kZXgoXG4gICAgICAgIHRoaXMuX3ZpZXcuc3RhdGljTm9kZURlYnVnSW5mb3MsXG4gICAgICAgIChzdGF0aWNOb2RlSW5mbzogU3RhdGljTm9kZURlYnVnSW5mbywgbm9kZUluZGV4OiBudW1iZXIpID0+IHtcbiAgICAgICAgICB2YXIgdmFycyA9IHN0YXRpY05vZGVJbmZvLnZhclRva2VucztcbiAgICAgICAgICBTdHJpbmdNYXBXcmFwcGVyLmZvckVhY2godmFycywgKHZhclRva2VuLCB2YXJOYW1lKSA9PiB7XG4gICAgICAgICAgICB2YXIgdmFyVmFsdWU7XG4gICAgICAgICAgICBpZiAoaXNCbGFuayh2YXJUb2tlbikpIHtcbiAgICAgICAgICAgICAgdmFyVmFsdWUgPSBpc1ByZXNlbnQodGhpcy5fdmlldy5hbGxOb2RlcykgPyB0aGlzLl92aWV3LmFsbE5vZGVzW25vZGVJbmRleF0gOiBudWxsO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgdmFyVmFsdWUgPSB0aGlzLl92aWV3LmluamVjdG9yR2V0KHZhclRva2VuLCBub2RlSW5kZXgsIG51bGwpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyVmFsdWVzW3Zhck5hbWVdID0gdmFyVmFsdWU7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIFN0cmluZ01hcFdyYXBwZXIuZm9yRWFjaCh0aGlzLl92aWV3LmxvY2FscyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKGxvY2FsVmFsdWUsIGxvY2FsTmFtZSkgPT4geyB2YXJWYWx1ZXNbbG9jYWxOYW1lXSA9IGxvY2FsVmFsdWU7IH0pO1xuICAgIHJldHVybiB2YXJWYWx1ZXM7XG4gIH1cbn1cbiJdfQ==