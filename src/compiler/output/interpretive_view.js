'use strict';"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var lang_1 = require('angular2/src/facade/lang');
var view_1 = require('angular2/src/core/linker/view');
var exceptions_1 = require('angular2/src/facade/exceptions');
var InterpretiveAppViewInstanceFactory = (function () {
    function InterpretiveAppViewInstanceFactory() {
    }
    InterpretiveAppViewInstanceFactory.prototype.createInstance = function (superClass, clazz, args, props, getters, methods) {
        if (superClass === view_1.AppView) {
            // We are always using DebugAppView as parent.
            // However, in prod mode we generate a constructor call that does
            // not have the argument for the debugNodeInfos.
            args = args.concat([null]);
            return new _InterpretiveAppView(args, props, getters, methods);
        }
        else if (superClass === view_1.DebugAppView) {
            return new _InterpretiveAppView(args, props, getters, methods);
        }
        throw new exceptions_1.BaseException("Can't instantiate class " + superClass + " in interpretative mode");
    };
    return InterpretiveAppViewInstanceFactory;
}());
exports.InterpretiveAppViewInstanceFactory = InterpretiveAppViewInstanceFactory;
var _InterpretiveAppView = (function (_super) {
    __extends(_InterpretiveAppView, _super);
    function _InterpretiveAppView(args, props, getters, methods) {
        _super.call(this, args[0], args[1], args[2], args[3], args[4], args[5], args[6], args[7], args[8], args[9], args[10]);
        this.props = props;
        this.getters = getters;
        this.methods = methods;
    }
    _InterpretiveAppView.prototype.createInternal = function (rootSelector) {
        var m = this.methods.get('createInternal');
        if (lang_1.isPresent(m)) {
            m(rootSelector);
        }
        else {
            _super.prototype.createInternal.call(this, rootSelector);
        }
    };
    _InterpretiveAppView.prototype.injectorGetInternal = function (token, nodeIndex, notFoundResult) {
        var m = this.methods.get('injectorGetInternal');
        if (lang_1.isPresent(m)) {
            return m(token, nodeIndex, notFoundResult);
        }
        else {
            return _super.prototype.injectorGet.call(this, token, nodeIndex, notFoundResult);
        }
    };
    _InterpretiveAppView.prototype.destroyInternal = function () {
        var m = this.methods.get('destroyInternal');
        if (lang_1.isPresent(m)) {
            return m();
        }
        else {
            return _super.prototype.destroyInternal.call(this);
        }
    };
    _InterpretiveAppView.prototype.dirtyParentQueriesInternal = function () {
        var m = this.methods.get('dirtyParentQueriesInternal');
        if (lang_1.isPresent(m)) {
            return m();
        }
        else {
            return _super.prototype.dirtyParentQueriesInternal.call(this);
        }
    };
    _InterpretiveAppView.prototype.detectChangesInternal = function (throwOnChange) {
        var m = this.methods.get('detectChangesInternal');
        if (lang_1.isPresent(m)) {
            return m(throwOnChange);
        }
        else {
            return _super.prototype.detectChangesInternal.call(this, throwOnChange);
        }
    };
    return _InterpretiveAppView;
}(view_1.DebugAppView));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW50ZXJwcmV0aXZlX3ZpZXcuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJkaWZmaW5nX3BsdWdpbl93cmFwcGVyLW91dHB1dF9wYXRoLXR1VlQzeWdjLnRtcC9hbmd1bGFyMi9zcmMvY29tcGlsZXIvb3V0cHV0L2ludGVycHJldGl2ZV92aWV3LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLHFCQUF3QiwwQkFBMEIsQ0FBQyxDQUFBO0FBQ25ELHFCQUFvQywrQkFBK0IsQ0FBQyxDQUFBO0FBQ3BFLDJCQUE0QixnQ0FBZ0MsQ0FBQyxDQUFBO0FBRzdEO0lBQUE7SUFjQSxDQUFDO0lBYkMsMkRBQWMsR0FBZCxVQUFlLFVBQWUsRUFBRSxLQUFVLEVBQUUsSUFBVyxFQUFFLEtBQXVCLEVBQ2pFLE9BQThCLEVBQUUsT0FBOEI7UUFDM0UsRUFBRSxDQUFDLENBQUMsVUFBVSxLQUFLLGNBQU8sQ0FBQyxDQUFDLENBQUM7WUFDM0IsOENBQThDO1lBQzlDLGlFQUFpRTtZQUNqRSxnREFBZ0Q7WUFDaEQsSUFBSSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQzNCLE1BQU0sQ0FBQyxJQUFJLG9CQUFvQixDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQ2pFLENBQUM7UUFBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsVUFBVSxLQUFLLG1CQUFZLENBQUMsQ0FBQyxDQUFDO1lBQ3ZDLE1BQU0sQ0FBQyxJQUFJLG9CQUFvQixDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQ2pFLENBQUM7UUFDRCxNQUFNLElBQUksMEJBQWEsQ0FBQyw2QkFBMkIsVUFBVSw0QkFBeUIsQ0FBQyxDQUFDO0lBQzFGLENBQUM7SUFDSCx5Q0FBQztBQUFELENBQUMsQUFkRCxJQWNDO0FBZFksMENBQWtDLHFDQWM5QyxDQUFB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YUFBYSxDQUFDLENBQUM7UUFDMUIsQ0FBQztRQUFDLElBQUksQ0FBQyxDQUFDO1lBQ04sTUFBTSxDQUFDLGdCQUFLLENBQUMscUJBQXFCLFlBQUMsYUFBYSxDQUFDLENBQUM7UUFDcEQsQ0FBQztJQUNILENBQUM7SUFDSCwyQkFBQztBQUFELENBQUMsQUE5Q0QsQ0FBbUMsbUJBQVksR0E4QzlDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtpc1ByZXNlbnR9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge0FwcFZpZXcsIERlYnVnQXBwVmlld30gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvbGlua2VyL3ZpZXcnO1xuaW1wb3J0IHtCYXNlRXhjZXB0aW9ufSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2V4Y2VwdGlvbnMnO1xuaW1wb3J0IHtJbnN0YW5jZUZhY3RvcnksIER5bmFtaWNJbnN0YW5jZX0gZnJvbSAnLi9vdXRwdXRfaW50ZXJwcmV0ZXInO1xuXG5leHBvcnQgY2xhc3MgSW50ZXJwcmV0aXZlQXBwVmlld0luc3RhbmNlRmFjdG9yeSBpbXBsZW1lbnRzIEluc3RhbmNlRmFjdG9yeSB7XG4gIGNyZWF0ZUluc3RhbmNlKHN1cGVyQ2xhc3M6IGFueSwgY2xheno6IGFueSwgYXJnczogYW55W10sIHByb3BzOiBNYXA8c3RyaW5nLCBhbnk+LFxuICAgICAgICAgICAgICAgICBnZXR0ZXJzOiBNYXA8c3RyaW5nLCBGdW5jdGlvbj4sIG1ldGhvZHM6IE1hcDxzdHJpbmcsIEZ1bmN0aW9uPik6IGFueSB7XG4gICAgaWYgKHN1cGVyQ2xhc3MgPT09IEFwcFZpZXcpIHtcbiAgICAgIC8vIFdlIGFyZSBhbHdheXMgdXNpbmcgRGVidWdBcHBWaWV3IGFzIHBhcmVudC5cbiAgICAgIC8vIEhvd2V2ZXIsIGluIHByb2QgbW9kZSB3ZSBnZW5lcmF0ZSBhIGNvbnN0cnVjdG9yIGNhbGwgdGhhdCBkb2VzXG4gICAgICAvLyBub3QgaGF2ZSB0aGUgYXJndW1lbnQgZm9yIHRoZSBkZWJ1Z05vZGVJbmZvcy5cbiAgICAgIGFyZ3MgPSBhcmdzLmNvbmNhdChbbnVsbF0pO1xuICAgICAgcmV0dXJuIG5ldyBfSW50ZXJwcmV0aXZlQXBwVmlldyhhcmdzLCBwcm9wcywgZ2V0dGVycywgbWV0aG9kcyk7XG4gICAgfSBlbHNlIGlmIChzdXBlckNsYXNzID09PSBEZWJ1Z0FwcFZpZXcpIHtcbiAgICAgIHJldHVybiBuZXcgX0ludGVycHJldGl2ZUFwcFZpZXcoYXJncywgcHJvcHMsIGdldHRlcnMsIG1ldGhvZHMpO1xuICAgIH1cbiAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbihgQ2FuJ3QgaW5zdGFudGlhdGUgY2xhc3MgJHtzdXBlckNsYXNzfSBpbiBpbnRlcnByZXRhdGl2ZSBtb2RlYCk7XG4gIH1cbn1cblxuY2xhc3MgX0ludGVycHJldGl2ZUFwcFZpZXcgZXh0ZW5kcyBEZWJ1Z0FwcFZpZXc8YW55PiBpbXBsZW1lbnRzIER5bmFtaWNJbnN0YW5jZSB7XG4gIGNvbnN0cnVjdG9yKGFyZ3M6IGFueVtdLCBwdWJsaWMgcHJvcHM6IE1hcDxzdHJpbmcsIGFueT4sIHB1YmxpYyBnZXR0ZXJzOiBNYXA8c3RyaW5nLCBGdW5jdGlvbj4sXG4gICAgICAgICAgICAgIHB1YmxpYyBtZXRob2RzOiBNYXA8c3RyaW5nLCBGdW5jdGlvbj4pIHtcbiAgICBzdXBlcihhcmdzWzBdLCBhcmdzWzFdLCBhcmdzWzJdLCBhcmdzWzNdLCBhcmdzWzRdLCBhcmdzWzVdLCBhcmdzWzZdLCBhcmdzWzddLCBhcmdzWzhdLCBhcmdzWzldLFxuICAgICAgICAgIGFyZ3NbMTBdKTtcbiAgfVxuICBjcmVhdGVJbnRlcm5hbChyb290U2VsZWN0b3I6IHN0cmluZyk6IHZvaWQge1xuICAgIHZhciBtID0gdGhpcy5tZXRob2RzLmdldCgnY3JlYXRlSW50ZXJuYWwnKTtcbiAgICBpZiAoaXNQcmVzZW50KG0pKSB7XG4gICAgICBtKHJvb3RTZWxlY3Rvcik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHN1cGVyLmNyZWF0ZUludGVybmFsKHJvb3RTZWxlY3Rvcik7XG4gICAgfVxuICB9XG4gIGluamVjdG9yR2V0SW50ZXJuYWwodG9rZW46IGFueSwgbm9kZUluZGV4OiBudW1iZXIsIG5vdEZvdW5kUmVzdWx0OiBhbnkpOiBhbnkge1xuICAgIHZhciBtID0gdGhpcy5tZXRob2RzLmdldCgnaW5qZWN0b3JHZXRJbnRlcm5hbCcpO1xuICAgIGlmIChpc1ByZXNlbnQobSkpIHtcbiAgICAgIHJldHVybiBtKHRva2VuLCBub2RlSW5kZXgsIG5vdEZvdW5kUmVzdWx0KTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHN1cGVyLmluamVjdG9yR2V0KHRva2VuLCBub2RlSW5kZXgsIG5vdEZvdW5kUmVzdWx0KTtcbiAgICB9XG4gIH1cbiAgZGVzdHJveUludGVybmFsKCk6IHZvaWQge1xuICAgIHZhciBtID0gdGhpcy5tZXRob2RzLmdldCgnZGVzdHJveUludGVybmFsJyk7XG4gICAgaWYgKGlzUHJlc2VudChtKSkge1xuICAgICAgcmV0dXJuIG0oKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHN1cGVyLmRlc3Ryb3lJbnRlcm5hbCgpO1xuICAgIH1cbiAgfVxuICBkaXJ0eVBhcmVudFF1ZXJpZXNJbnRlcm5hbCgpOiB2b2lkIHtcbiAgICB2YXIgbSA9IHRoaXMubWV0aG9kcy5nZXQoJ2RpcnR5UGFyZW50UXVlcmllc0ludGVybmFsJyk7XG4gICAgaWYgKGlzUHJlc2VudChtKSkge1xuICAgICAgcmV0dXJuIG0oKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHN1cGVyLmRpcnR5UGFyZW50UXVlcmllc0ludGVybmFsKCk7XG4gICAgfVxuICB9XG4gIGRldGVjdENoYW5nZXNJbnRlcm5hbCh0aHJvd09uQ2hhbmdlOiBib29sZWFuKTogdm9pZCB7XG4gICAgdmFyIG0gPSB0aGlzLm1ldGhvZHMuZ2V0KCdkZXRlY3RDaGFuZ2VzSW50ZXJuYWwnKTtcbiAgICBpZiAoaXNQcmVzZW50KG0pKSB7XG4gICAgICByZXR1cm4gbSh0aHJvd09uQ2hhbmdlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHN1cGVyLmRldGVjdENoYW5nZXNJbnRlcm5hbCh0aHJvd09uQ2hhbmdlKTtcbiAgICB9XG4gIH1cbn1cbiJdfQ==