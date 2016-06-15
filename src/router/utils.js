'use strict';"use strict";
var lang_1 = require('angular2/src/facade/lang');
var collection_1 = require('angular2/src/facade/collection');
var core_1 = require('angular2/core');
var reflection_1 = require('angular2/src/core/reflection/reflection');
var lifecycle_annotations_impl_1 = require('./lifecycle/lifecycle_annotations_impl');
var TouchMap = (function () {
    function TouchMap(map) {
        var _this = this;
        this.map = {};
        this.keys = {};
        if (lang_1.isPresent(map)) {
            collection_1.StringMapWrapper.forEach(map, function (value, key) {
                _this.map[key] = lang_1.isPresent(value) ? value.toString() : null;
                _this.keys[key] = true;
            });
        }
    }
    TouchMap.prototype.get = function (key) {
        collection_1.StringMapWrapper.delete(this.keys, key);
        return this.map[key];
    };
    TouchMap.prototype.getUnused = function () {
        var _this = this;
        var unused = {};
        var keys = collection_1.StringMapWrapper.keys(this.keys);
        keys.forEach(function (key) { return unused[key] = collection_1.StringMapWrapper.get(_this.map, key); });
        return unused;
    };
    return TouchMap;
}());
exports.TouchMap = TouchMap;
function normalizeString(obj) {
    if (lang_1.isBlank(obj)) {
        return null;
    }
    else {
        return obj.toString();
    }
}
exports.normalizeString = normalizeString;
function getComponentAnnotations(comp) {
    if (comp instanceof core_1.ComponentFactory) {
        return comp.metadata;
    }
    else {
        return reflection_1.reflector.annotations(comp);
    }
}
exports.getComponentAnnotations = getComponentAnnotations;
function getComponentType(comp) {
    return comp instanceof core_1.ComponentFactory ? comp.componentType : comp;
}
exports.getComponentType = getComponentType;
function getCanActivateHook(component) {
    var annotations = getComponentAnnotations(component);
    for (var i = 0; i < annotations.length; i += 1) {
        var annotation = annotations[i];
        if (annotation instanceof lifecycle_annotations_impl_1.CanActivate) {
            return annotation.fn;
        }
    }
    return null;
}
exports.getCanActivateHook = getCanActivateHook;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJkaWZmaW5nX3BsdWdpbl93cmFwcGVyLW91dHB1dF9wYXRoLWVnOXFsVndYLnRtcC9hbmd1bGFyMi9zcmMvcm91dGVyL3V0aWxzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxxQkFBdUMsMEJBQTBCLENBQUMsQ0FBQTtBQUNsRSwyQkFBK0IsZ0NBQWdDLENBQUMsQ0FBQTtBQUNoRSxxQkFBK0IsZUFBZSxDQUFDLENBQUE7QUFDL0MsMkJBQXdCLHlDQUF5QyxDQUFDLENBQUE7QUFDbEUsMkNBQTBCLHdDQUF3QyxDQUFDLENBQUE7QUFFbkU7SUFJRSxrQkFBWSxHQUF5QjtRQUp2QyxpQkF3QkM7UUF2QkMsUUFBRyxHQUE0QixFQUFFLENBQUM7UUFDbEMsU0FBSSxHQUE2QixFQUFFLENBQUM7UUFHbEMsRUFBRSxDQUFDLENBQUMsZ0JBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDbkIsNkJBQWdCLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRSxVQUFDLEtBQUssRUFBRSxHQUFHO2dCQUN2QyxLQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLGdCQUFTLENBQUMsS0FBSyxDQUFDLEdBQUcsS0FBSyxDQUFDLFFBQVEsRUFBRSxHQUFHLElBQUksQ0FBQztnQkFDM0QsS0FBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUM7WUFDeEIsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDO0lBQ0gsQ0FBQztJQUVELHNCQUFHLEdBQUgsVUFBSSxHQUFXO1FBQ2IsNkJBQWdCLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDeEMsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDdkIsQ0FBQztJQUVELDRCQUFTLEdBQVQ7UUFBQSxpQkFLQztRQUpDLElBQUksTUFBTSxHQUF5QixFQUFFLENBQUM7UUFDdEMsSUFBSSxJQUFJLEdBQUcsNkJBQWdCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUM1QyxJQUFJLENBQUMsT0FBTyxDQUFDLFVBQUEsR0FBRyxJQUFJLE9BQUEsTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLDZCQUFnQixDQUFDLEdBQUcsQ0FBQyxLQUFJLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxFQUFqRCxDQUFpRCxDQUFDLENBQUM7UUFDdkUsTUFBTSxDQUFDLE1BQU0sQ0FBQztJQUNoQixDQUFDO0lBQ0gsZUFBQztBQUFELENBQUMsQUF4QkQsSUF3QkM7QUF4QlksZ0JBQVEsV0F3QnBCLENBQUE7QUFHRCx5QkFBZ0MsR0FBUTtJQUN0QyxFQUFFLENBQUMsQ0FBQyxjQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2pCLE1BQU0sQ0FBQyxJQUFJLENBQUM7SUFDZCxDQUFDO0lBQUMsSUFBSSxDQUFDLENBQUM7UUFDTixNQUFNLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxDQUFDO0lBQ3hCLENBQUM7QUFDSCxDQUFDO0FBTmUsdUJBQWUsa0JBTTlCLENBQUE7QUFFRCxpQ0FBd0MsSUFBNkI7SUFDbkUsRUFBRSxDQUFDLENBQUMsSUFBSSxZQUFZLHVCQUFnQixDQUFDLENBQUMsQ0FBQztRQUNyQyxNQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQztJQUN2QixDQUFDO0lBQUMsSUFBSSxDQUFDLENBQUM7UUFDTixNQUFNLENBQUMsc0JBQVMsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDckMsQ0FBQztBQUNILENBQUM7QUFOZSwrQkFBdUIsMEJBTXRDLENBQUE7QUFFRCwwQkFBaUMsSUFBNkI7SUFDNUQsTUFBTSxDQUFDLElBQUksWUFBWSx1QkFBZ0IsR0FBRyxJQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQztBQUN0RSxDQUFDO0FBRmUsd0JBQWdCLG1CQUUvQixDQUFBO0FBRUQsNEJBQW1DLFNBQVM7SUFDMUMsSUFBSSxXQUFXLEdBQUcsdUJBQXVCLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDckQsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxXQUFXLENBQUMsTUFBTSxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQztRQUMvQyxJQUFJLFVBQVUsR0FBRyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDaEMsRUFBRSxDQUFDLENBQUMsVUFBVSxZQUFZLHdDQUFXLENBQUMsQ0FBQyxDQUFDO1lBQ3RDLE1BQU0sQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDO1FBQ3ZCLENBQUM7SUFDSCxDQUFDO0lBRUQsTUFBTSxDQUFDLElBQUksQ0FBQztBQUNkLENBQUM7QUFWZSwwQkFBa0IscUJBVWpDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge2lzUHJlc2VudCwgaXNCbGFuaywgVHlwZX0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcbmltcG9ydCB7U3RyaW5nTWFwV3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9jb2xsZWN0aW9uJztcbmltcG9ydCB7Q29tcG9uZW50RmFjdG9yeX0gZnJvbSAnYW5ndWxhcjIvY29yZSc7XG5pbXBvcnQge3JlZmxlY3Rvcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvcmVmbGVjdGlvbi9yZWZsZWN0aW9uJztcbmltcG9ydCB7Q2FuQWN0aXZhdGV9IGZyb20gJy4vbGlmZWN5Y2xlL2xpZmVjeWNsZV9hbm5vdGF0aW9uc19pbXBsJztcblxuZXhwb3J0IGNsYXNzIFRvdWNoTWFwIHtcbiAgbWFwOiB7W2tleTogc3RyaW5nXTogc3RyaW5nfSA9IHt9O1xuICBrZXlzOiB7W2tleTogc3RyaW5nXTogYm9vbGVhbn0gPSB7fTtcblxuICBjb25zdHJ1Y3RvcihtYXA6IHtba2V5OiBzdHJpbmddOiBhbnl9KSB7XG4gICAgaWYgKGlzUHJlc2VudChtYXApKSB7XG4gICAgICBTdHJpbmdNYXBXcmFwcGVyLmZvckVhY2gobWFwLCAodmFsdWUsIGtleSkgPT4ge1xuICAgICAgICB0aGlzLm1hcFtrZXldID0gaXNQcmVzZW50KHZhbHVlKSA/IHZhbHVlLnRvU3RyaW5nKCkgOiBudWxsO1xuICAgICAgICB0aGlzLmtleXNba2V5XSA9IHRydWU7XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBnZXQoa2V5OiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIFN0cmluZ01hcFdyYXBwZXIuZGVsZXRlKHRoaXMua2V5cywga2V5KTtcbiAgICByZXR1cm4gdGhpcy5tYXBba2V5XTtcbiAgfVxuXG4gIGdldFVudXNlZCgpOiB7W2tleTogc3RyaW5nXTogYW55fSB7XG4gICAgdmFyIHVudXNlZDoge1trZXk6IHN0cmluZ106IGFueX0gPSB7fTtcbiAgICB2YXIga2V5cyA9IFN0cmluZ01hcFdyYXBwZXIua2V5cyh0aGlzLmtleXMpO1xuICAgIGtleXMuZm9yRWFjaChrZXkgPT4gdW51c2VkW2tleV0gPSBTdHJpbmdNYXBXcmFwcGVyLmdldCh0aGlzLm1hcCwga2V5KSk7XG4gICAgcmV0dXJuIHVudXNlZDtcbiAgfVxufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBub3JtYWxpemVTdHJpbmcob2JqOiBhbnkpOiBzdHJpbmcge1xuICBpZiAoaXNCbGFuayhvYmopKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIG9iai50b1N0cmluZygpO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRDb21wb25lbnRBbm5vdGF0aW9ucyhjb21wOiBUeXBlIHwgQ29tcG9uZW50RmFjdG9yeSk6IGFueVtdIHtcbiAgaWYgKGNvbXAgaW5zdGFuY2VvZiBDb21wb25lbnRGYWN0b3J5KSB7XG4gICAgcmV0dXJuIGNvbXAubWV0YWRhdGE7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIHJlZmxlY3Rvci5hbm5vdGF0aW9ucyhjb21wKTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0Q29tcG9uZW50VHlwZShjb21wOiBUeXBlIHwgQ29tcG9uZW50RmFjdG9yeSk6IFR5cGUge1xuICByZXR1cm4gY29tcCBpbnN0YW5jZW9mIENvbXBvbmVudEZhY3RvcnkgPyBjb21wLmNvbXBvbmVudFR5cGUgOiBjb21wO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0Q2FuQWN0aXZhdGVIb29rKGNvbXBvbmVudCk6IEZ1bmN0aW9uIHtcbiAgdmFyIGFubm90YXRpb25zID0gZ2V0Q29tcG9uZW50QW5ub3RhdGlvbnMoY29tcG9uZW50KTtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBhbm5vdGF0aW9ucy5sZW5ndGg7IGkgKz0gMSkge1xuICAgIGxldCBhbm5vdGF0aW9uID0gYW5ub3RhdGlvbnNbaV07XG4gICAgaWYgKGFubm90YXRpb24gaW5zdGFuY2VvZiBDYW5BY3RpdmF0ZSkge1xuICAgICAgcmV0dXJuIGFubm90YXRpb24uZm47XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG51bGw7XG59XG4iXX0=