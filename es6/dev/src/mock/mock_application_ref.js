var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { ApplicationRef } from 'angular2/src/core/application_ref';
import { Injectable } from 'angular2/src/core/di';
/**
 * A no-op implementation of {@link ApplicationRef}, useful for testing.
 */
export let MockApplicationRef = class MockApplicationRef extends ApplicationRef {
    registerBootstrapListener(listener) { }
    registerDisposeListener(dispose) { }
    bootstrap(componentType, bindings) {
        return null;
    }
    get injector() { return null; }
    ;
    get zone() { return null; }
    ;
    dispose() { }
    tick() { }
    get componentTypes() { return null; }
    ;
};
MockApplicationRef = __decorate([
    Injectable(), 
    __metadata('design:paramtypes', [])
], MockApplicationRef);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9ja19hcHBsaWNhdGlvbl9yZWYuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJkaWZmaW5nX3BsdWdpbl93cmFwcGVyLW91dHB1dF9wYXRoLWZYeWVXTW5wLnRtcC9hbmd1bGFyMi9zcmMvbW9jay9tb2NrX2FwcGxpY2F0aW9uX3JlZi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7T0FBTyxFQUFDLGNBQWMsRUFBQyxNQUFNLG1DQUFtQztPQUN6RCxFQUFDLFVBQVUsRUFBQyxNQUFNLHNCQUFzQjtBQU0vQzs7R0FFRztBQUVILGlFQUF3QyxjQUFjO0lBQ3BELHlCQUF5QixDQUFDLFFBQXFDLElBQVMsQ0FBQztJQUV6RSx1QkFBdUIsQ0FBQyxPQUFtQixJQUFTLENBQUM7SUFFckQsU0FBUyxDQUFDLGFBQW1CLEVBQUUsUUFBeUM7UUFDdEUsTUFBTSxDQUFDLElBQUksQ0FBQztJQUNkLENBQUM7SUFFRCxJQUFJLFFBQVEsS0FBZSxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQzs7SUFFekMsSUFBSSxJQUFJLEtBQWEsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7O0lBRW5DLE9BQU8sS0FBVSxDQUFDO0lBRWxCLElBQUksS0FBVSxDQUFDO0lBRWYsSUFBSSxjQUFjLEtBQWEsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7O0FBQy9DLENBQUM7QUFuQkQ7SUFBQyxVQUFVLEVBQUU7O3NCQUFBO0FBbUJaIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtBcHBsaWNhdGlvblJlZn0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvYXBwbGljYXRpb25fcmVmJztcbmltcG9ydCB7SW5qZWN0YWJsZX0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvZGknO1xuaW1wb3J0IHtUeXBlfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtDb21wb25lbnRSZWZ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2xpbmtlci9jb21wb25lbnRfZmFjdG9yeSc7XG5pbXBvcnQge1Byb3ZpZGVyLCBJbmplY3Rvcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvZGknO1xuaW1wb3J0IHtOZ1pvbmV9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL3pvbmUvbmdfem9uZSc7XG5cbi8qKlxuICogQSBuby1vcCBpbXBsZW1lbnRhdGlvbiBvZiB7QGxpbmsgQXBwbGljYXRpb25SZWZ9LCB1c2VmdWwgZm9yIHRlc3RpbmcuXG4gKi9cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBNb2NrQXBwbGljYXRpb25SZWYgZXh0ZW5kcyBBcHBsaWNhdGlvblJlZiB7XG4gIHJlZ2lzdGVyQm9vdHN0cmFwTGlzdGVuZXIobGlzdGVuZXI6IChyZWY6IENvbXBvbmVudFJlZikgPT4gdm9pZCk6IHZvaWQge31cblxuICByZWdpc3RlckRpc3Bvc2VMaXN0ZW5lcihkaXNwb3NlOiAoKSA9PiB2b2lkKTogdm9pZCB7fVxuXG4gIGJvb3RzdHJhcChjb21wb25lbnRUeXBlOiBUeXBlLCBiaW5kaW5ncz86IEFycmF5PFR5cGUgfCBQcm92aWRlciB8IGFueVtdPik6IFByb21pc2U8Q29tcG9uZW50UmVmPiB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICBnZXQgaW5qZWN0b3IoKTogSW5qZWN0b3IgeyByZXR1cm4gbnVsbDsgfTtcblxuICBnZXQgem9uZSgpOiBOZ1pvbmUgeyByZXR1cm4gbnVsbDsgfTtcblxuICBkaXNwb3NlKCk6IHZvaWQge31cblxuICB0aWNrKCk6IHZvaWQge31cblxuICBnZXQgY29tcG9uZW50VHlwZXMoKTogVHlwZVtdIHsgcmV0dXJuIG51bGw7IH07XG59XG4iXX0=