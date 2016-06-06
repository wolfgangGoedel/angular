'use strict';"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var injector_1 = require('angular2/src/core/di/injector');
var ElementInjector = (function (_super) {
    __extends(ElementInjector, _super);
    function ElementInjector(_view, _nodeIndex) {
        _super.call(this);
        this._view = _view;
        this._nodeIndex = _nodeIndex;
    }
    ElementInjector.prototype.get = function (token) {
        var result = this._view.injectorGet(token, this._nodeIndex, injector_1.UNDEFINED);
        if (result === injector_1.UNDEFINED) {
            result = this._view.parentInjector.get(token);
        }
        return result;
    };
    ElementInjector.prototype.getOptional = function (token) {
        var result = this._view.injectorGet(token, this._nodeIndex, injector_1.UNDEFINED);
        if (result === injector_1.UNDEFINED) {
            result = this._view.parentInjector.getOptional(token);
        }
        return result;
    };
    return ElementInjector;
}(injector_1.Injector));
exports.ElementInjector = ElementInjector;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZWxlbWVudF9pbmplY3Rvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRpZmZpbmdfcGx1Z2luX3dyYXBwZXItb3V0cHV0X3BhdGgtSzlLQTNhblQudG1wL2FuZ3VsYXIyL3NyYy9jb3JlL2xpbmtlci9lbGVtZW50X2luamVjdG9yLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUNBLHlCQUFrQywrQkFBK0IsQ0FBQyxDQUFBO0FBR2xFO0lBQXFDLG1DQUFRO0lBQzNDLHlCQUFvQixLQUFtQixFQUFVLFVBQWtCO1FBQUksaUJBQU8sQ0FBQztRQUEzRCxVQUFLLEdBQUwsS0FBSyxDQUFjO1FBQVUsZUFBVSxHQUFWLFVBQVUsQ0FBUTtJQUFhLENBQUM7SUFFakYsNkJBQUcsR0FBSCxVQUFJLEtBQVU7UUFDWixJQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLFVBQVUsRUFBRSxvQkFBUyxDQUFDLENBQUM7UUFDdkUsRUFBRSxDQUFDLENBQUMsTUFBTSxLQUFLLG9CQUFTLENBQUMsQ0FBQyxDQUFDO1lBQ3pCLE1BQU0sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDaEQsQ0FBQztRQUNELE1BQU0sQ0FBQyxNQUFNLENBQUM7SUFDaEIsQ0FBQztJQUVELHFDQUFXLEdBQVgsVUFBWSxLQUFVO1FBQ3BCLElBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsVUFBVSxFQUFFLG9CQUFTLENBQUMsQ0FBQztRQUN2RSxFQUFFLENBQUMsQ0FBQyxNQUFNLEtBQUssb0JBQVMsQ0FBQyxDQUFDLENBQUM7WUFDekIsTUFBTSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsY0FBYyxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUN4RCxDQUFDO1FBQ0QsTUFBTSxDQUFDLE1BQU0sQ0FBQztJQUNoQixDQUFDO0lBQ0gsc0JBQUM7QUFBRCxDQUFDLEFBbEJELENBQXFDLG1CQUFRLEdBa0I1QztBQWxCWSx1QkFBZSxrQkFrQjNCLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge2lzQmxhbmssIHN0cmluZ2lmeX0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcbmltcG9ydCB7SW5qZWN0b3IsIFVOREVGSU5FRH0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvZGkvaW5qZWN0b3InO1xuaW1wb3J0IHtBcHBWaWV3fSBmcm9tICcuL3ZpZXcnO1xuXG5leHBvcnQgY2xhc3MgRWxlbWVudEluamVjdG9yIGV4dGVuZHMgSW5qZWN0b3Ige1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIF92aWV3OiBBcHBWaWV3PGFueT4sIHByaXZhdGUgX25vZGVJbmRleDogbnVtYmVyKSB7IHN1cGVyKCk7IH1cblxuICBnZXQodG9rZW46IGFueSk6IGFueSB7XG4gICAgdmFyIHJlc3VsdCA9IHRoaXMuX3ZpZXcuaW5qZWN0b3JHZXQodG9rZW4sIHRoaXMuX25vZGVJbmRleCwgVU5ERUZJTkVEKTtcbiAgICBpZiAocmVzdWx0ID09PSBVTkRFRklORUQpIHtcbiAgICAgIHJlc3VsdCA9IHRoaXMuX3ZpZXcucGFyZW50SW5qZWN0b3IuZ2V0KHRva2VuKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIGdldE9wdGlvbmFsKHRva2VuOiBhbnkpOiBhbnkge1xuICAgIHZhciByZXN1bHQgPSB0aGlzLl92aWV3LmluamVjdG9yR2V0KHRva2VuLCB0aGlzLl9ub2RlSW5kZXgsIFVOREVGSU5FRCk7XG4gICAgaWYgKHJlc3VsdCA9PT0gVU5ERUZJTkVEKSB7XG4gICAgICByZXN1bHQgPSB0aGlzLl92aWV3LnBhcmVudEluamVjdG9yLmdldE9wdGlvbmFsKHRva2VuKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxufVxuIl19