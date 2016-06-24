'use strict';"use strict";
var lang_1 = require('angular2/src/facade/lang');
var core_1 = require('angular2/core');
/**
 * `LocationStrategy` is responsible for representing and reading route state
 * from the browser's URL. Angular provides two strategies:
 * {@link HashLocationStrategy} and {@link PathLocationStrategy} (default).
 *
 * This is used under the hood of the {@link Location} service.
 *
 * Applications should use the {@link Router} or {@link Location} services to
 * interact with application route state.
 *
 * For instance, {@link HashLocationStrategy} produces URLs like
 * `http://example.com#/foo`, and {@link PathLocationStrategy} produces
 * `http://example.com/foo` as an equivalent URL.
 *
 * See these two classes for more.
 */
var LocationStrategy = (function () {
    function LocationStrategy() {
    }
    return LocationStrategy;
}());
exports.LocationStrategy = LocationStrategy;
/**
 * The `APP_BASE_HREF` token represents the base href to be used with the
 * {@link PathLocationStrategy}.
 *
 * If you're using {@link PathLocationStrategy}, you must provide a provider to a string
 * representing the URL prefix that should be preserved when generating and recognizing
 * URLs.
 *
 * ### Example
 *
 * ```
 * import {Component} from 'angular2/core';
 * import {ROUTER_DIRECTIVES, ROUTER_PROVIDERS, RouteConfig} from 'angular2/router';
 * import {APP_BASE_HREF} from 'angular2/platform/common';
 *
 * @Component({directives: [ROUTER_DIRECTIVES]})
 * @RouteConfig([
 *  {...},
 * ])
 * class AppCmp {
 *   // ...
 * }
 *
 * bootstrap(AppCmp, [
 *   ROUTER_PROVIDERS,
 *   provide(APP_BASE_HREF, {useValue: '/my/app'})
 * ]);
 * ```
 */
exports.APP_BASE_HREF = lang_1.CONST_EXPR(new core_1.OpaqueToken('appBaseHref'));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9jYXRpb25fc3RyYXRlZ3kuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJkaWZmaW5nX3BsdWdpbl93cmFwcGVyLW91dHB1dF9wYXRoLWxMYmZ6MjkzLnRtcC9hbmd1bGFyMi9zcmMvcGxhdGZvcm0vYnJvd3Nlci9sb2NhdGlvbi9sb2NhdGlvbl9zdHJhdGVneS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEscUJBQXlCLDBCQUEwQixDQUFDLENBQUE7QUFDcEQscUJBQTBCLGVBQWUsQ0FBQyxDQUFBO0FBRzFDOzs7Ozs7Ozs7Ozs7Ozs7R0FlRztBQUNIO0lBQUE7SUFVQSxDQUFDO0lBQUQsdUJBQUM7QUFBRCxDQUFDLEFBVkQsSUFVQztBQVZxQix3QkFBZ0IsbUJBVXJDLENBQUE7QUFHRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQTRCRztBQUNVLHFCQUFhLEdBQWdCLGlCQUFVLENBQUMsSUFBSSxrQkFBVyxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge0NPTlNUX0VYUFJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge09wYXF1ZVRva2VufSBmcm9tICdhbmd1bGFyMi9jb3JlJztcbmltcG9ydCB7VXJsQ2hhbmdlTGlzdGVuZXJ9IGZyb20gJy4vcGxhdGZvcm1fbG9jYXRpb24nO1xuXG4vKipcbiAqIGBMb2NhdGlvblN0cmF0ZWd5YCBpcyByZXNwb25zaWJsZSBmb3IgcmVwcmVzZW50aW5nIGFuZCByZWFkaW5nIHJvdXRlIHN0YXRlXG4gKiBmcm9tIHRoZSBicm93c2VyJ3MgVVJMLiBBbmd1bGFyIHByb3ZpZGVzIHR3byBzdHJhdGVnaWVzOlxuICoge0BsaW5rIEhhc2hMb2NhdGlvblN0cmF0ZWd5fSBhbmQge0BsaW5rIFBhdGhMb2NhdGlvblN0cmF0ZWd5fSAoZGVmYXVsdCkuXG4gKlxuICogVGhpcyBpcyB1c2VkIHVuZGVyIHRoZSBob29kIG9mIHRoZSB7QGxpbmsgTG9jYXRpb259IHNlcnZpY2UuXG4gKlxuICogQXBwbGljYXRpb25zIHNob3VsZCB1c2UgdGhlIHtAbGluayBSb3V0ZXJ9IG9yIHtAbGluayBMb2NhdGlvbn0gc2VydmljZXMgdG9cbiAqIGludGVyYWN0IHdpdGggYXBwbGljYXRpb24gcm91dGUgc3RhdGUuXG4gKlxuICogRm9yIGluc3RhbmNlLCB7QGxpbmsgSGFzaExvY2F0aW9uU3RyYXRlZ3l9IHByb2R1Y2VzIFVSTHMgbGlrZVxuICogYGh0dHA6Ly9leGFtcGxlLmNvbSMvZm9vYCwgYW5kIHtAbGluayBQYXRoTG9jYXRpb25TdHJhdGVneX0gcHJvZHVjZXNcbiAqIGBodHRwOi8vZXhhbXBsZS5jb20vZm9vYCBhcyBhbiBlcXVpdmFsZW50IFVSTC5cbiAqXG4gKiBTZWUgdGhlc2UgdHdvIGNsYXNzZXMgZm9yIG1vcmUuXG4gKi9cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBMb2NhdGlvblN0cmF0ZWd5IHtcbiAgYWJzdHJhY3QgcGF0aCgpOiBzdHJpbmc7XG4gIGFic3RyYWN0IGhhc2goKTogc3RyaW5nO1xuICBhYnN0cmFjdCBwcmVwYXJlRXh0ZXJuYWxVcmwoaW50ZXJuYWw6IHN0cmluZyk6IHN0cmluZztcbiAgYWJzdHJhY3QgcHVzaFN0YXRlKHN0YXRlOiBhbnksIHRpdGxlOiBzdHJpbmcsIHVybDogc3RyaW5nLCBxdWVyeVBhcmFtczogc3RyaW5nKTogdm9pZDtcbiAgYWJzdHJhY3QgcmVwbGFjZVN0YXRlKHN0YXRlOiBhbnksIHRpdGxlOiBzdHJpbmcsIHVybDogc3RyaW5nLCBxdWVyeVBhcmFtczogc3RyaW5nKTogdm9pZDtcbiAgYWJzdHJhY3QgZm9yd2FyZCgpOiB2b2lkO1xuICBhYnN0cmFjdCBiYWNrKCk6IHZvaWQ7XG4gIGFic3RyYWN0IG9uUG9wU3RhdGUoZm46IFVybENoYW5nZUxpc3RlbmVyKTogdm9pZDtcbiAgYWJzdHJhY3QgZ2V0QmFzZUhyZWYoKTogc3RyaW5nO1xufVxuXG5cbi8qKlxuICogVGhlIGBBUFBfQkFTRV9IUkVGYCB0b2tlbiByZXByZXNlbnRzIHRoZSBiYXNlIGhyZWYgdG8gYmUgdXNlZCB3aXRoIHRoZVxuICoge0BsaW5rIFBhdGhMb2NhdGlvblN0cmF0ZWd5fS5cbiAqXG4gKiBJZiB5b3UncmUgdXNpbmcge0BsaW5rIFBhdGhMb2NhdGlvblN0cmF0ZWd5fSwgeW91IG11c3QgcHJvdmlkZSBhIHByb3ZpZGVyIHRvIGEgc3RyaW5nXG4gKiByZXByZXNlbnRpbmcgdGhlIFVSTCBwcmVmaXggdGhhdCBzaG91bGQgYmUgcHJlc2VydmVkIHdoZW4gZ2VuZXJhdGluZyBhbmQgcmVjb2duaXppbmdcbiAqIFVSTHMuXG4gKlxuICogIyMjIEV4YW1wbGVcbiAqXG4gKiBgYGBcbiAqIGltcG9ydCB7Q29tcG9uZW50fSBmcm9tICdhbmd1bGFyMi9jb3JlJztcbiAqIGltcG9ydCB7Uk9VVEVSX0RJUkVDVElWRVMsIFJPVVRFUl9QUk9WSURFUlMsIFJvdXRlQ29uZmlnfSBmcm9tICdhbmd1bGFyMi9yb3V0ZXInO1xuICogaW1wb3J0IHtBUFBfQkFTRV9IUkVGfSBmcm9tICdhbmd1bGFyMi9wbGF0Zm9ybS9jb21tb24nO1xuICpcbiAqIEBDb21wb25lbnQoe2RpcmVjdGl2ZXM6IFtST1VURVJfRElSRUNUSVZFU119KVxuICogQFJvdXRlQ29uZmlnKFtcbiAqICB7Li4ufSxcbiAqIF0pXG4gKiBjbGFzcyBBcHBDbXAge1xuICogICAvLyAuLi5cbiAqIH1cbiAqXG4gKiBib290c3RyYXAoQXBwQ21wLCBbXG4gKiAgIFJPVVRFUl9QUk9WSURFUlMsXG4gKiAgIHByb3ZpZGUoQVBQX0JBU0VfSFJFRiwge3VzZVZhbHVlOiAnL215L2FwcCd9KVxuICogXSk7XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGNvbnN0IEFQUF9CQVNFX0hSRUY6IE9wYXF1ZVRva2VuID0gQ09OU1RfRVhQUihuZXcgT3BhcXVlVG9rZW4oJ2FwcEJhc2VIcmVmJykpO1xuIl19