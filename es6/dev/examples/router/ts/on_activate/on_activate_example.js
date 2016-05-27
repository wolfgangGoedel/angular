var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component, provide } from 'angular2/core';
import { bootstrap } from 'angular2/platform/browser';
import { RouteConfig, ROUTER_DIRECTIVES } from 'angular2/router';
import { APP_BASE_HREF } from 'angular2/platform/common';
// #docregion routerOnActivate
let ChildCmp = class ChildCmp {
};
ChildCmp = __decorate([
    Component({ template: `Child` }), 
    __metadata('design:paramtypes', [])
], ChildCmp);
let ParentCmp = class ParentCmp {
    constructor() {
        this.log = '';
    }
    routerOnActivate(next, prev) {
        this.log = `Finished navigating from "${prev ? prev.urlPath : 'null'}" to "${next.urlPath}"`;
        return new Promise(resolve => {
            // The ChildCmp gets instantiated only when the Promise is resolved
            setTimeout(() => resolve(null), 1000);
        });
    }
};
ParentCmp = __decorate([
    Component({
        template: `
    <h2>Parent</h2> (<router-outlet></router-outlet>) 
    <p>{{log}}</p>`,
        directives: [ROUTER_DIRECTIVES]
    }),
    RouteConfig([{ path: '/child', name: 'Child', component: ChildCmp }]), 
    __metadata('design:paramtypes', [])
], ParentCmp);
// #enddocregion
export let AppCmp = class AppCmp {
};
AppCmp = __decorate([
    Component({
        selector: 'example-app',
        template: `
    <h1>My app</h1>
    
    <nav>
      <a [routerLink]="['Parent', 'Child']">Child</a>
    </nav>
    <router-outlet></router-outlet>
  `,
        directives: [ROUTER_DIRECTIVES]
    }),
    RouteConfig([{ path: '/parent/...', name: 'Parent', component: ParentCmp }]), 
    __metadata('design:paramtypes', [])
], AppCmp);
export function main() {
    return bootstrap(AppCmp, [provide(APP_BASE_HREF, { useValue: '/angular2/examples/router/ts/on_activate' })]);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib25fYWN0aXZhdGVfZXhhbXBsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRpZmZpbmdfcGx1Z2luX3dyYXBwZXItb3V0cHV0X3BhdGgtc200NmxFNHQudG1wL2FuZ3VsYXIyL2V4YW1wbGVzL3JvdXRlci90cy9vbl9hY3RpdmF0ZS9vbl9hY3RpdmF0ZV9leGFtcGxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztPQUFPLEVBQUMsU0FBUyxFQUFFLE9BQU8sRUFBQyxNQUFNLGVBQWU7T0FDekMsRUFBQyxTQUFTLEVBQUMsTUFBTSwyQkFBMkI7T0FDNUMsRUFBbUMsV0FBVyxFQUFFLGlCQUFpQixFQUFDLE1BQU0saUJBQWlCO09BQ3pGLEVBQUMsYUFBYSxFQUFDLE1BQU0sMEJBQTBCO0FBRXRELDhCQUE4QjtBQUU5QjtBQUNBLENBQUM7QUFGRDtJQUFDLFNBQVMsQ0FBQyxFQUFDLFFBQVEsRUFBRSxPQUFPLEVBQUMsQ0FBQzs7WUFBQTtBQVcvQjtJQUFBO1FBQ0UsUUFBRyxHQUFXLEVBQUUsQ0FBQztJQVVuQixDQUFDO0lBUkMsZ0JBQWdCLENBQUMsSUFBMEIsRUFBRSxJQUEwQjtRQUNyRSxJQUFJLENBQUMsR0FBRyxHQUFHLDZCQUE2QixJQUFJLEdBQUcsSUFBSSxDQUFDLE9BQU8sR0FBRyxNQUFNLFNBQVMsSUFBSSxDQUFDLE9BQU8sR0FBRyxDQUFDO1FBRTdGLE1BQU0sQ0FBQyxJQUFJLE9BQU8sQ0FBQyxPQUFPO1lBQ3hCLG1FQUFtRTtZQUNuRSxVQUFVLENBQUMsTUFBTSxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDeEMsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDO0FBQ0gsQ0FBQztBQWxCRDtJQUFDLFNBQVMsQ0FBQztRQUNULFFBQVEsRUFBRTs7bUJBRU87UUFDakIsVUFBVSxFQUFFLENBQUMsaUJBQWlCLENBQUM7S0FDaEMsQ0FBQztJQUNELFdBQVcsQ0FBQyxDQUFDLEVBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLFNBQVMsRUFBRSxRQUFRLEVBQUMsQ0FBQyxDQUFDOzthQUFBO0FBYXBFLGdCQUFnQjtBQWdCaEI7QUFDQSxDQUFDO0FBZEQ7SUFBQyxTQUFTLENBQUM7UUFDVCxRQUFRLEVBQUUsYUFBYTtRQUN2QixRQUFRLEVBQUU7Ozs7Ozs7R0FPVDtRQUNELFVBQVUsRUFBRSxDQUFDLGlCQUFpQixDQUFDO0tBQ2hDLENBQUM7SUFDRCxXQUFXLENBQUMsQ0FBQyxFQUFDLElBQUksRUFBRSxhQUFhLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFDLENBQUMsQ0FBQzs7VUFBQTtBQUkzRTtJQUNFLE1BQU0sQ0FBQyxTQUFTLENBQ1osTUFBTSxFQUFFLENBQUMsT0FBTyxDQUFDLGFBQWEsRUFBRSxFQUFDLFFBQVEsRUFBRSwwQ0FBMEMsRUFBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ2hHLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0NvbXBvbmVudCwgcHJvdmlkZX0gZnJvbSAnYW5ndWxhcjIvY29yZSc7XG5pbXBvcnQge2Jvb3RzdHJhcH0gZnJvbSAnYW5ndWxhcjIvcGxhdGZvcm0vYnJvd3Nlcic7XG5pbXBvcnQge09uQWN0aXZhdGUsIENvbXBvbmVudEluc3RydWN0aW9uLCBSb3V0ZUNvbmZpZywgUk9VVEVSX0RJUkVDVElWRVN9IGZyb20gJ2FuZ3VsYXIyL3JvdXRlcic7XG5pbXBvcnQge0FQUF9CQVNFX0hSRUZ9IGZyb20gJ2FuZ3VsYXIyL3BsYXRmb3JtL2NvbW1vbic7XG5cbi8vICNkb2NyZWdpb24gcm91dGVyT25BY3RpdmF0ZVxuQENvbXBvbmVudCh7dGVtcGxhdGU6IGBDaGlsZGB9KVxuY2xhc3MgQ2hpbGRDbXAge1xufVxuXG5AQ29tcG9uZW50KHtcbiAgdGVtcGxhdGU6IGBcbiAgICA8aDI+UGFyZW50PC9oMj4gKDxyb3V0ZXItb3V0bGV0Pjwvcm91dGVyLW91dGxldD4pIFxuICAgIDxwPnt7bG9nfX08L3A+YCxcbiAgZGlyZWN0aXZlczogW1JPVVRFUl9ESVJFQ1RJVkVTXVxufSlcbkBSb3V0ZUNvbmZpZyhbe3BhdGg6ICcvY2hpbGQnLCBuYW1lOiAnQ2hpbGQnLCBjb21wb25lbnQ6IENoaWxkQ21wfV0pXG5jbGFzcyBQYXJlbnRDbXAgaW1wbGVtZW50cyBPbkFjdGl2YXRlIHtcbiAgbG9nOiBzdHJpbmcgPSAnJztcblxuICByb3V0ZXJPbkFjdGl2YXRlKG5leHQ6IENvbXBvbmVudEluc3RydWN0aW9uLCBwcmV2OiBDb21wb25lbnRJbnN0cnVjdGlvbikge1xuICAgIHRoaXMubG9nID0gYEZpbmlzaGVkIG5hdmlnYXRpbmcgZnJvbSBcIiR7cHJldiA/IHByZXYudXJsUGF0aCA6ICdudWxsJ31cIiB0byBcIiR7bmV4dC51cmxQYXRofVwiYDtcblxuICAgIHJldHVybiBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHtcbiAgICAgIC8vIFRoZSBDaGlsZENtcCBnZXRzIGluc3RhbnRpYXRlZCBvbmx5IHdoZW4gdGhlIFByb21pc2UgaXMgcmVzb2x2ZWRcbiAgICAgIHNldFRpbWVvdXQoKCkgPT4gcmVzb2x2ZShudWxsKSwgMTAwMCk7XG4gICAgfSk7XG4gIH1cbn1cbi8vICNlbmRkb2NyZWdpb25cblxuXG5AQ29tcG9uZW50KHtcbiAgc2VsZWN0b3I6ICdleGFtcGxlLWFwcCcsXG4gIHRlbXBsYXRlOiBgXG4gICAgPGgxPk15IGFwcDwvaDE+XG4gICAgXG4gICAgPG5hdj5cbiAgICAgIDxhIFtyb3V0ZXJMaW5rXT1cIlsnUGFyZW50JywgJ0NoaWxkJ11cIj5DaGlsZDwvYT5cbiAgICA8L25hdj5cbiAgICA8cm91dGVyLW91dGxldD48L3JvdXRlci1vdXRsZXQ+XG4gIGAsXG4gIGRpcmVjdGl2ZXM6IFtST1VURVJfRElSRUNUSVZFU11cbn0pXG5AUm91dGVDb25maWcoW3twYXRoOiAnL3BhcmVudC8uLi4nLCBuYW1lOiAnUGFyZW50JywgY29tcG9uZW50OiBQYXJlbnRDbXB9XSlcbmV4cG9ydCBjbGFzcyBBcHBDbXAge1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbWFpbigpIHtcbiAgcmV0dXJuIGJvb3RzdHJhcChcbiAgICAgIEFwcENtcCwgW3Byb3ZpZGUoQVBQX0JBU0VfSFJFRiwge3VzZVZhbHVlOiAnL2FuZ3VsYXIyL2V4YW1wbGVzL3JvdXRlci90cy9vbl9hY3RpdmF0ZSd9KV0pO1xufVxuIl19