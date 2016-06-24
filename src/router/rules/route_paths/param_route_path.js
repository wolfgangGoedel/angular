'use strict';"use strict";
var lang_1 = require('angular2/src/facade/lang');
var exceptions_1 = require('angular2/src/facade/exceptions');
var collection_1 = require('angular2/src/facade/collection');
var utils_1 = require('../../utils');
var url_parser_1 = require('../../url_parser');
var route_path_1 = require('./route_path');
/**
 * Identified by a `...` URL segment. This indicates that the
 * Route will continue to be matched by child `Router`s.
 */
var ContinuationPathSegment = (function () {
    function ContinuationPathSegment() {
        this.name = '';
        this.specificity = '';
        this.hash = '...';
    }
    ContinuationPathSegment.prototype.generate = function (params) { return ''; };
    ContinuationPathSegment.prototype.match = function (path) { return true; };
    return ContinuationPathSegment;
}());
/**
 * Identified by a string not starting with a `:` or `*`.
 * Only matches the URL segments that equal the segment path
 */
var StaticPathSegment = (function () {
    function StaticPathSegment(path) {
        this.path = path;
        this.name = '';
        this.specificity = '2';
        this.hash = path;
    }
    StaticPathSegment.prototype.match = function (path) { return path == this.path; };
    StaticPathSegment.prototype.generate = function (params) { return this.path; };
    return StaticPathSegment;
}());
/**
 * Identified by a string starting with `:`. Indicates a segment
 * that can contain a value that will be extracted and provided to
 * a matching `Instruction`.
 */
var DynamicPathSegment = (function () {
    function DynamicPathSegment(name) {
        this.name = name;
        this.specificity = '1';
        this.hash = ':';
    }
    DynamicPathSegment.prototype.match = function (path) { return path.length > 0; };
    DynamicPathSegment.prototype.generate = function (params) {
        if (!collection_1.StringMapWrapper.contains(params.map, this.name)) {
            throw new exceptions_1.BaseException("Route generator for '" + this.name + "' was not included in parameters passed.");
        }
        return encodeDynamicSegment(utils_1.normalizeString(params.get(this.name)));
    };
    DynamicPathSegment.paramMatcher = /^:([^\/]+)$/g;
    return DynamicPathSegment;
}());
/**
 * Identified by a string starting with `*` Indicates that all the following
 * segments match this route and that the value of these segments should
 * be provided to a matching `Instruction`.
 */
var StarPathSegment = (function () {
    function StarPathSegment(name) {
        this.name = name;
        this.specificity = '0';
        this.hash = '*';
    }
    StarPathSegment.prototype.match = function (path) { return true; };
    StarPathSegment.prototype.generate = function (params) { return utils_1.normalizeString(params.get(this.name)); };
    StarPathSegment.wildcardMatcher = /^\*([^\/]+)$/g;
    return StarPathSegment;
}());
/**
 * Parses a URL string using a given matcher DSL, and generates URLs from param maps
 */
var ParamRoutePath = (function () {
    /**
     * Takes a string representing the matcher DSL
     */
    function ParamRoutePath(routePath) {
        this.routePath = routePath;
        this.terminal = true;
        this._assertValidPath(routePath);
        this._parsePathString(routePath);
        this.specificity = this._calculateSpecificity();
        this.hash = this._calculateHash();
        var lastSegment = this._segments[this._segments.length - 1];
        this.terminal = !(lastSegment instanceof ContinuationPathSegment);
    }
    ParamRoutePath.prototype.matchUrl = function (url) {
        var nextUrlSegment = url;
        var currentUrlSegment;
        var positionalParams = {};
        var captured = [];
        for (var i = 0; i < this._segments.length; i += 1) {
            var pathSegment = this._segments[i];
            currentUrlSegment = nextUrlSegment;
            if (pathSegment instanceof ContinuationPathSegment) {
                break;
            }
            if (lang_1.isPresent(currentUrlSegment)) {
                // the star segment consumes all of the remaining URL, including matrix params
                if (pathSegment instanceof StarPathSegment) {
                    positionalParams[pathSegment.name] = currentUrlSegment.toString();
                    captured.push(currentUrlSegment.toString());
                    nextUrlSegment = null;
                    break;
                }
                captured.push(currentUrlSegment.path);
                if (pathSegment instanceof DynamicPathSegment) {
                    positionalParams[pathSegment.name] = decodeDynamicSegment(currentUrlSegment.path);
                }
                else if (!pathSegment.match(currentUrlSegment.path)) {
                    return null;
                }
                nextUrlSegment = currentUrlSegment.child;
            }
            else if (!pathSegment.match('')) {
                return null;
            }
        }
        if (this.terminal && lang_1.isPresent(nextUrlSegment)) {
            return null;
        }
        var urlPath = captured.join('/');
        var auxiliary = [];
        var urlParams = [];
        var allParams = positionalParams;
        if (lang_1.isPresent(currentUrlSegment)) {
            // If this is the root component, read query params. Otherwise, read matrix params.
            var paramsSegment = url instanceof url_parser_1.RootUrl ? url : currentUrlSegment;
            if (lang_1.isPresent(paramsSegment.params)) {
                allParams = collection_1.StringMapWrapper.merge(paramsSegment.params, positionalParams);
                urlParams = url_parser_1.convertUrlParamsToArray(paramsSegment.params);
            }
            else {
                allParams = positionalParams;
            }
            auxiliary = currentUrlSegment.auxiliary;
        }
        return new route_path_1.MatchedUrl(urlPath, urlParams, allParams, auxiliary, nextUrlSegment);
    };
    ParamRoutePath.prototype.generateUrl = function (params) {
        var paramTokens = new utils_1.TouchMap(params);
        var path = [];
        for (var i = 0; i < this._segments.length; i++) {
            var segment = this._segments[i];
            if (!(segment instanceof ContinuationPathSegment)) {
                var generated = segment.generate(paramTokens);
                if (lang_1.isPresent(generated) || !(segment instanceof StarPathSegment)) {
                    path.push(generated);
                }
            }
        }
        var urlPath = path.join('/');
        var nonPositionalParams = paramTokens.getUnused();
        var urlParams = nonPositionalParams;
        return new route_path_1.GeneratedUrl(urlPath, urlParams);
    };
    ParamRoutePath.prototype.toString = function () { return this.routePath; };
    ParamRoutePath.prototype._parsePathString = function (routePath) {
        // normalize route as not starting with a "/". Recognition will
        // also normalize.
        if (routePath.startsWith("/")) {
            routePath = routePath.substring(1);
        }
        var segmentStrings = routePath.split('/');
        this._segments = [];
        var limit = segmentStrings.length - 1;
        for (var i = 0; i <= limit; i++) {
            var segment = segmentStrings[i], match;
            if (lang_1.isPresent(match = lang_1.RegExpWrapper.firstMatch(DynamicPathSegment.paramMatcher, segment))) {
                this._segments.push(new DynamicPathSegment(match[1]));
            }
            else if (lang_1.isPresent(match = lang_1.RegExpWrapper.firstMatch(StarPathSegment.wildcardMatcher, segment))) {
                this._segments.push(new StarPathSegment(match[1]));
            }
            else if (segment == '...') {
                if (i < limit) {
                    throw new exceptions_1.BaseException("Unexpected \"...\" before the end of the path for \"" + routePath + "\".");
                }
                this._segments.push(new ContinuationPathSegment());
            }
            else {
                this._segments.push(new StaticPathSegment(segment));
            }
        }
    };
    ParamRoutePath.prototype._calculateSpecificity = function () {
        // The "specificity" of a path is used to determine which route is used when multiple routes
        // match
        // a URL. Static segments (like "/foo") are the most specific, followed by dynamic segments
        // (like
        // "/:id"). Star segments add no specificity. Segments at the start of the path are more
        // specific
        // than proceeding ones.
        //
        // The code below uses place values to combine the different types of segments into a single
        // string that we can sort later. Each static segment is marked as a specificity of "2," each
        // dynamic segment is worth "1" specificity, and stars are worth "0" specificity.
        var i, length = this._segments.length, specificity;
        if (length == 0) {
            // a single slash (or "empty segment" is as specific as a static segment
            specificity += '2';
        }
        else {
            specificity = '';
            for (i = 0; i < length; i++) {
                specificity += this._segments[i].specificity;
            }
        }
        return specificity;
    };
    ParamRoutePath.prototype._calculateHash = function () {
        // this function is used to determine whether a route config path like `/foo/:id` collides with
        // `/foo/:name`
        var i, length = this._segments.length;
        var hashParts = [];
        for (i = 0; i < length; i++) {
            hashParts.push(this._segments[i].hash);
        }
        return hashParts.join('/');
    };
    ParamRoutePath.prototype._assertValidPath = function (path) {
        if (lang_1.StringWrapper.contains(path, '#')) {
            throw new exceptions_1.BaseException("Path \"" + path + "\" should not include \"#\". Use \"HashLocationStrategy\" instead.");
        }
        var illegalCharacter = lang_1.RegExpWrapper.firstMatch(ParamRoutePath.RESERVED_CHARS, path);
        if (lang_1.isPresent(illegalCharacter)) {
            throw new exceptions_1.BaseException("Path \"" + path + "\" contains \"" + illegalCharacter[0] + "\" which is not allowed in a route config.");
        }
    };
    ParamRoutePath.RESERVED_CHARS = lang_1.RegExpWrapper.create('//|\\(|\\)|;|\\?|=');
    return ParamRoutePath;
}());
exports.ParamRoutePath = ParamRoutePath;
var REGEXP_PERCENT = /%/g;
var REGEXP_SLASH = /\//g;
var REGEXP_OPEN_PARENT = /\(/g;
var REGEXP_CLOSE_PARENT = /\)/g;
var REGEXP_SEMICOLON = /;/g;
function encodeDynamicSegment(value) {
    if (lang_1.isBlank(value)) {
        return null;
    }
    value = lang_1.StringWrapper.replaceAll(value, REGEXP_PERCENT, '%25');
    value = lang_1.StringWrapper.replaceAll(value, REGEXP_SLASH, '%2F');
    value = lang_1.StringWrapper.replaceAll(value, REGEXP_OPEN_PARENT, '%28');
    value = lang_1.StringWrapper.replaceAll(value, REGEXP_CLOSE_PARENT, '%29');
    value = lang_1.StringWrapper.replaceAll(value, REGEXP_SEMICOLON, '%3B');
    return value;
}
var REGEXP_ENC_SEMICOLON = /%3B/ig;
var REGEXP_ENC_CLOSE_PARENT = /%29/ig;
var REGEXP_ENC_OPEN_PARENT = /%28/ig;
var REGEXP_ENC_SLASH = /%2F/ig;
var REGEXP_ENC_PERCENT = /%25/ig;
function decodeDynamicSegment(value) {
    if (lang_1.isBlank(value)) {
        return null;
    }
    value = lang_1.StringWrapper.replaceAll(value, REGEXP_ENC_SEMICOLON, ';');
    value = lang_1.StringWrapper.replaceAll(value, REGEXP_ENC_CLOSE_PARENT, ')');
    value = lang_1.StringWrapper.replaceAll(value, REGEXP_ENC_OPEN_PARENT, '(');
    value = lang_1.StringWrapper.replaceAll(value, REGEXP_ENC_SLASH, '/');
    value = lang_1.StringWrapper.replaceAll(value, REGEXP_ENC_PERCENT, '%');
    return value;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFyYW1fcm91dGVfcGF0aC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRpZmZpbmdfcGx1Z2luX3dyYXBwZXItb3V0cHV0X3BhdGgtbExiZnoyOTMudG1wL2FuZ3VsYXIyL3NyYy9yb3V0ZXIvcnVsZXMvcm91dGVfcGF0aHMvcGFyYW1fcm91dGVfcGF0aC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEscUJBQStELDBCQUEwQixDQUFDLENBQUE7QUFDMUYsMkJBQTRCLGdDQUFnQyxDQUFDLENBQUE7QUFDN0QsMkJBQStCLGdDQUFnQyxDQUFDLENBQUE7QUFFaEUsc0JBQXdDLGFBQWEsQ0FBQyxDQUFBO0FBQ3RELDJCQUFvRCxrQkFBa0IsQ0FBQyxDQUFBO0FBQ3ZFLDJCQUFrRCxjQUFjLENBQUMsQ0FBQTtBQWlCakU7OztHQUdHO0FBQ0g7SUFBQTtRQUNFLFNBQUksR0FBVyxFQUFFLENBQUM7UUFDbEIsZ0JBQVcsR0FBRyxFQUFFLENBQUM7UUFDakIsU0FBSSxHQUFHLEtBQUssQ0FBQztJQUdmLENBQUM7SUFGQywwQ0FBUSxHQUFSLFVBQVMsTUFBZ0IsSUFBWSxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUNqRCx1Q0FBSyxHQUFMLFVBQU0sSUFBWSxJQUFhLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQy9DLDhCQUFDO0FBQUQsQ0FBQyxBQU5ELElBTUM7QUFFRDs7O0dBR0c7QUFDSDtJQUlFLDJCQUFtQixJQUFZO1FBQVosU0FBSSxHQUFKLElBQUksQ0FBUTtRQUgvQixTQUFJLEdBQVcsRUFBRSxDQUFDO1FBQ2xCLGdCQUFXLEdBQUcsR0FBRyxDQUFDO1FBRWlCLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO0lBQUMsQ0FBQztJQUN0RCxpQ0FBSyxHQUFMLFVBQU0sSUFBWSxJQUFhLE1BQU0sQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDMUQsb0NBQVEsR0FB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Q25FLEtBQUssR0FBRyxvQkFBYSxDQUFDLFVBQVUsQ0FBQyxLQUFLLEVBQUUsdUJBQXVCLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFDdEUsS0FBSyxHQUFHLG9CQUFhLENBQUMsVUFBVSxDQUFDLEtBQUssRUFBRSxzQkFBc0IsRUFBRSxHQUFHLENBQUMsQ0FBQztJQUNyRSxLQUFLLEdBQUcsb0JBQWEsQ0FBQyxVQUFVLENBQUMsS0FBSyxFQUFFLGdCQUFnQixFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQy9ELEtBQUssR0FBRyxvQkFBYSxDQUFDLFVBQVUsQ0FBQyxLQUFLLEVBQUUsa0JBQWtCLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFFakUsTUFBTSxDQUFDLEtBQUssQ0FBQztBQUNmLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1JlZ0V4cFdyYXBwZXIsIFN0cmluZ1dyYXBwZXIsIGlzUHJlc2VudCwgaXNCbGFua30gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcbmltcG9ydCB7QmFzZUV4Y2VwdGlvbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9leGNlcHRpb25zJztcbmltcG9ydCB7U3RyaW5nTWFwV3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9jb2xsZWN0aW9uJztcblxuaW1wb3J0IHtUb3VjaE1hcCwgbm9ybWFsaXplU3RyaW5nfSBmcm9tICcuLi8uLi91dGlscyc7XG5pbXBvcnQge1VybCwgUm9vdFVybCwgY29udmVydFVybFBhcmFtc1RvQXJyYXl9IGZyb20gJy4uLy4uL3VybF9wYXJzZXInO1xuaW1wb3J0IHtSb3V0ZVBhdGgsIEdlbmVyYXRlZFVybCwgTWF0Y2hlZFVybH0gZnJvbSAnLi9yb3V0ZV9wYXRoJztcblxuXG5cbi8qKlxuICogYFBhcmFtUm91dGVQYXRoYHMgYXJlIG1hZGUgdXAgb2YgYFBhdGhTZWdtZW50YHMsIGVhY2ggb2Ygd2hpY2ggY2FuXG4gKiBtYXRjaCBhIHNlZ21lbnQgb2YgYSBVUkwuIERpZmZlcmVudCBraW5kIG9mIGBQYXRoU2VnbWVudGBzIG1hdGNoXG4gKiBVUkwgc2VnbWVudHMgaW4gZGlmZmVyZW50IHdheXMuLi5cbiAqL1xuaW50ZXJmYWNlIFBhdGhTZWdtZW50IHtcbiAgbmFtZTogc3RyaW5nO1xuICBnZW5lcmF0ZShwYXJhbXM6IFRvdWNoTWFwKTogc3RyaW5nO1xuICBtYXRjaChwYXRoOiBzdHJpbmcpOiBib29sZWFuO1xuICBzcGVjaWZpY2l0eTogc3RyaW5nO1xuICBoYXNoOiBzdHJpbmc7XG59XG5cbi8qKlxuICogSWRlbnRpZmllZCBieSBhIGAuLi5gIFVSTCBzZWdtZW50LiBUaGlzIGluZGljYXRlcyB0aGF0IHRoZVxuICogUm91dGUgd2lsbCBjb250aW51ZSB0byBiZSBtYXRjaGVkIGJ5IGNoaWxkIGBSb3V0ZXJgcy5cbiAqL1xuY2xhc3MgQ29udGludWF0aW9uUGF0aFNlZ21lbnQgaW1wbGVtZW50cyBQYXRoU2VnbWVudCB7XG4gIG5hbWU6IHN0cmluZyA9ICcnO1xuICBzcGVjaWZpY2l0eSA9ICcnO1xuICBoYXNoID0gJy4uLic7XG4gIGdlbmVyYXRlKHBhcmFtczogVG91Y2hNYXApOiBzdHJpbmcgeyByZXR1cm4gJyc7IH1cbiAgbWF0Y2gocGF0aDogc3RyaW5nKTogYm9vbGVhbiB7IHJldHVybiB0cnVlOyB9XG59XG5cbi8qKlxuICogSWRlbnRpZmllZCBieSBhIHN0cmluZyBub3Qgc3RhcnRpbmcgd2l0aCBhIGA6YCBvciBgKmAuXG4gKiBPbmx5IG1hdGNoZXMgdGhlIFVSTCBzZWdtZW50cyB0aGF0IGVxdWFsIHRoZSBzZWdtZW50IHBhdGhcbiAqL1xuY2xhc3MgU3RhdGljUGF0aFNlZ21lbnQgaW1wbGVtZW50cyBQYXRoU2VnbWVudCB7XG4gIG5hbWU6IHN0cmluZyA9ICcnO1xuICBzcGVjaWZpY2l0eSA9ICcyJztcbiAgaGFzaDogc3RyaW5nO1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgcGF0aDogc3RyaW5nKSB7IHRoaXMuaGFzaCA9IHBhdGg7IH1cbiAgbWF0Y2gocGF0aDogc3RyaW5nKTogYm9vbGVhbiB7IHJldHVybiBwYXRoID09IHRoaXMucGF0aDsgfVxuICBnZW5lcmF0ZShwYXJhbXM6IFRvdWNoTWFwKTogc3RyaW5nIHsgcmV0dXJuIHRoaXMucGF0aDsgfVxufVxuXG4vKipcbiAqIElkZW50aWZpZWQgYnkgYSBzdHJpbmcgc3RhcnRpbmcgd2l0aCBgOmAuIEluZGljYXRlcyBhIHNlZ21lbnRcbiAqIHRoYXQgY2FuIGNvbnRhaW4gYSB2YWx1ZSB0aGF0IHdpbGwgYmUgZXh0cmFjdGVkIGFuZCBwcm92aWRlZCB0b1xuICogYSBtYXRjaGluZyBgSW5zdHJ1Y3Rpb25gLlxuICovXG5jbGFzcyBEeW5hbWljUGF0aFNlZ21lbnQgaW1wbGVtZW50cyBQYXRoU2VnbWVudCB7XG4gIHN0YXRpYyBwYXJhbU1hdGNoZXIgPSAvXjooW15cXC9dKykkL2c7XG4gIHNwZWNpZmljaXR5ID0gJzEnO1xuICBoYXNoID0gJzonO1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgbmFtZTogc3RyaW5nKSB7fVxuICBtYXRjaChwYXRoOiBzdHJpbmcpOiBib29sZWFuIHsgcmV0dXJuIHBhdGgubGVuZ3RoID4gMDsgfVxuICBnZW5lcmF0ZShwYXJhbXM6IFRvdWNoTWFwKTogc3RyaW5nIHtcbiAgICBpZiAoIVN0cmluZ01hcFdyYXBwZXIuY29udGFpbnMocGFyYW1zLm1hcCwgdGhpcy5uYW1lKSkge1xuICAgICAgdGhyb3cgbmV3IEJhc2VFeGNlcHRpb24oXG4gICAgICAgICAgYFJvdXRlIGdlbmVyYXRvciBmb3IgJyR7dGhpcy5uYW1lfScgd2FzIG5vdCBpbmNsdWRlZCBpbiBwYXJhbWV0ZXJzIHBhc3NlZC5gKTtcbiAgICB9XG4gICAgcmV0dXJuIGVuY29kZUR5bmFtaWNTZWdtZW50KG5vcm1hbGl6ZVN0cmluZyhwYXJhbXMuZ2V0KHRoaXMubmFtZSkpKTtcbiAgfVxufVxuXG4vKipcbiAqIElkZW50aWZpZWQgYnkgYSBzdHJpbmcgc3RhcnRpbmcgd2l0aCBgKmAgSW5kaWNhdGVzIHRoYXQgYWxsIHRoZSBmb2xsb3dpbmdcbiAqIHNlZ21lbnRzIG1hdGNoIHRoaXMgcm91dGUgYW5kIHRoYXQgdGhlIHZhbHVlIG9mIHRoZXNlIHNlZ21lbnRzIHNob3VsZFxuICogYmUgcHJvdmlkZWQgdG8gYSBtYXRjaGluZyBgSW5zdHJ1Y3Rpb25gLlxuICovXG5jbGFzcyBTdGFyUGF0aFNlZ21lbnQgaW1wbGVtZW50cyBQYXRoU2VnbWVudCB7XG4gIHN0YXRpYyB3aWxkY2FyZE1hdGNoZXIgPSAvXlxcKihbXlxcL10rKSQvZztcbiAgc3BlY2lmaWNpdHkgPSAnMCc7XG4gIGhhc2ggPSAnKic7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBuYW1lOiBzdHJpbmcpIHt9XG4gIG1hdGNoKHBhdGg6IHN0cmluZyk6IGJvb2xlYW4geyByZXR1cm4gdHJ1ZTsgfVxuICBnZW5lcmF0ZShwYXJhbXM6IFRvdWNoTWFwKTogc3RyaW5nIHsgcmV0dXJuIG5vcm1hbGl6ZVN0cmluZyhwYXJhbXMuZ2V0KHRoaXMubmFtZSkpOyB9XG59XG5cbi8qKlxuICogUGFyc2VzIGEgVVJMIHN0cmluZyB1c2luZyBhIGdpdmVuIG1hdGNoZXIgRFNMLCBhbmQgZ2VuZXJhdGVzIFVSTHMgZnJvbSBwYXJhbSBtYXBzXG4gKi9cbmV4cG9ydCBjbGFzcyBQYXJhbVJvdXRlUGF0aCBpbXBsZW1lbnRzIFJvdXRlUGF0aCB7XG4gIHNwZWNpZmljaXR5OiBzdHJpbmc7XG4gIHRlcm1pbmFsOiBib29sZWFuID0gdHJ1ZTtcbiAgaGFzaDogc3RyaW5nO1xuXG4gIHByaXZhdGUgX3NlZ21lbnRzOiBQYXRoU2VnbWVudFtdO1xuXG4gIC8qKlxuICAgKiBUYWtlcyBhIHN0cmluZyByZXByZXNlbnRpbmcgdGhlIG1hdGNoZXIgRFNMXG4gICAqL1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgcm91dGVQYXRoOiBzdHJpbmcpIHtcbiAgICB0aGlzLl9hc3NlcnRWYWxpZFBhdGgocm91dGVQYXRoKTtcblxuICAgIHRoaXMuX3BhcnNlUGF0aFN0cmluZyhyb3V0ZVBhdGgpO1xuICAgIHRoaXMuc3BlY2lmaWNpdHkgPSB0aGlzLl9jYWxjdWxhdGVTcGVjaWZpY2l0eSgpO1xuICAgIHRoaXMuaGFzaCA9IHRoaXMuX2NhbGN1bGF0ZUhhc2goKTtcblxuICAgIHZhciBsYXN0U2VnbWVudCA9IHRoaXMuX3NlZ21lbnRzW3RoaXMuX3NlZ21lbnRzLmxlbmd0aCAtIDFdO1xuICAgIHRoaXMudGVybWluYWwgPSAhKGxhc3RTZWdtZW50IGluc3RhbmNlb2YgQ29udGludWF0aW9uUGF0aFNlZ21lbnQpO1xuICB9XG5cbiAgbWF0Y2hVcmwodXJsOiBVcmwpOiBNYXRjaGVkVXJsIHtcbiAgICB2YXIgbmV4dFVybFNlZ21lbnQgPSB1cmw7XG4gICAgdmFyIGN1cnJlbnRVcmxTZWdtZW50OiBVcmw7XG4gICAgdmFyIHBvc2l0aW9uYWxQYXJhbXMgPSB7fTtcbiAgICB2YXIgY2FwdHVyZWQ6IHN0cmluZ1tdID0gW107XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuX3NlZ21lbnRzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICB2YXIgcGF0aFNlZ21lbnQgPSB0aGlzLl9zZWdtZW50c1tpXTtcblxuICAgICAgY3VycmVudFVybFNlZ21lbnQgPSBuZXh0VXJsU2VnbWVudDtcbiAgICAgIGlmIChwYXRoU2VnbWVudCBpbnN0YW5jZW9mIENvbnRpbnVhdGlvblBhdGhTZWdtZW50KSB7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuXG4gICAgICBpZiAoaXNQcmVzZW50KGN1cnJlbnRVcmxTZWdtZW50KSkge1xuICAgICAgICAvLyB0aGUgc3RhciBzZWdtZW50IGNvbnN1bWVzIGFsbCBvZiB0aGUgcmVtYWluaW5nIFVSTCwgaW5jbHVkaW5nIG1hdHJpeCBwYXJhbXNcbiAgICAgICAgaWYgKHBhdGhTZWdtZW50IGluc3RhbmNlb2YgU3RhclBhdGhTZWdtZW50KSB7XG4gICAgICAgICAgcG9zaXRpb25hbFBhcmFtc1twYXRoU2VnbWVudC5uYW1lXSA9IGN1cnJlbnRVcmxTZWdtZW50LnRvU3RyaW5nKCk7XG4gICAgICAgICAgY2FwdHVyZWQucHVzaChjdXJyZW50VXJsU2VnbWVudC50b1N0cmluZygpKTtcbiAgICAgICAgICBuZXh0VXJsU2VnbWVudCA9IG51bGw7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cblxuICAgICAgICBjYXB0dXJlZC5wdXNoKGN1cnJlbnRVcmxTZWdtZW50LnBhdGgpO1xuXG4gICAgICAgIGlmIChwYXRoU2VnbWVudCBpbnN0YW5jZW9mIER5bmFtaWNQYXRoU2VnbWVudCkge1xuICAgICAgICAgIHBvc2l0aW9uYWxQYXJhbXNbcGF0aFNlZ21lbnQubmFtZV0gPSBkZWNvZGVEeW5hbWljU2VnbWVudChjdXJyZW50VXJsU2VnbWVudC5wYXRoKTtcbiAgICAgICAgfSBlbHNlIGlmICghcGF0aFNlZ21lbnQubWF0Y2goY3VycmVudFVybFNlZ21lbnQucGF0aCkpIHtcbiAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIG5leHRVcmxTZWdtZW50ID0gY3VycmVudFVybFNlZ21lbnQuY2hpbGQ7XG4gICAgICB9IGVsc2UgaWYgKCFwYXRoU2VnbWVudC5tYXRjaCgnJykpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHRoaXMudGVybWluYWwgJiYgaXNQcmVzZW50KG5leHRVcmxTZWdtZW50KSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgdmFyIHVybFBhdGggPSBjYXB0dXJlZC5qb2luKCcvJyk7XG5cbiAgICB2YXIgYXV4aWxpYXJ5ID0gW107XG4gICAgdmFyIHVybFBhcmFtcyA9IFtdO1xuICAgIHZhciBhbGxQYXJhbXMgPSBwb3NpdGlvbmFsUGFyYW1zO1xuICAgIGlmIChpc1ByZXNlbnQoY3VycmVudFVybFNlZ21lbnQpKSB7XG4gICAgICAvLyBJZiB0aGlzIGlzIHRoZSByb290IGNvbXBvbmVudCwgcmVhZCBxdWVyeSBwYXJhbXMuIE90aGVyd2lzZSwgcmVhZCBtYXRyaXggcGFyYW1zLlxuICAgICAgdmFyIHBhcmFtc1NlZ21lbnQgPSB1cmwgaW5zdGFuY2VvZiBSb290VXJsID8gdXJsIDogY3VycmVudFVybFNlZ21lbnQ7XG5cbiAgICAgIGlmIChpc1ByZXNlbnQocGFyYW1zU2VnbWVudC5wYXJhbXMpKSB7XG4gICAgICAgIGFsbFBhcmFtcyA9IFN0cmluZ01hcFdyYXBwZXIubWVyZ2UocGFyYW1zU2VnbWVudC5wYXJhbXMsIHBvc2l0aW9uYWxQYXJhbXMpO1xuICAgICAgICB1cmxQYXJhbXMgPSBjb252ZXJ0VXJsUGFyYW1zVG9BcnJheShwYXJhbXNTZWdtZW50LnBhcmFtcyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBhbGxQYXJhbXMgPSBwb3NpdGlvbmFsUGFyYW1zO1xuICAgICAgfVxuICAgICAgYXV4aWxpYXJ5ID0gY3VycmVudFVybFNlZ21lbnQuYXV4aWxpYXJ5O1xuICAgIH1cblxuICAgIHJldHVybiBuZXcgTWF0Y2hlZFVybCh1cmxQYXRoLCB1cmxQYXJhbXMsIGFsbFBhcmFtcywgYXV4aWxpYXJ5LCBuZXh0VXJsU2VnbWVudCk7XG4gIH1cblxuXG4gIGdlbmVyYXRlVXJsKHBhcmFtczoge1trZXk6IHN0cmluZ106IGFueX0pOiBHZW5lcmF0ZWRVcmwge1xuICAgIHZhciBwYXJhbVRva2VucyA9IG5ldyBUb3VjaE1hcChwYXJhbXMpO1xuXG4gICAgdmFyIHBhdGggPSBbXTtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5fc2VnbWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGxldCBzZWdtZW50ID0gdGhpcy5fc2VnbWVudHNbaV07XG4gICAgICBpZiAoIShzZWdtZW50IGluc3RhbmNlb2YgQ29udGludWF0aW9uUGF0aFNlZ21lbnQpKSB7XG4gICAgICAgIGxldCBnZW5lcmF0ZWQgPSBzZWdtZW50LmdlbmVyYXRlKHBhcmFtVG9rZW5zKTtcbiAgICAgICAgaWYgKGlzUHJlc2VudChnZW5lcmF0ZWQpIHx8ICEoc2VnbWVudCBpbnN0YW5jZW9mIFN0YXJQYXRoU2VnbWVudCkpIHtcbiAgICAgICAgICBwYXRoLnB1c2goZ2VuZXJhdGVkKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICB2YXIgdXJsUGF0aCA9IHBhdGguam9pbignLycpO1xuXG4gICAgdmFyIG5vblBvc2l0aW9uYWxQYXJhbXMgPSBwYXJhbVRva2Vucy5nZXRVbnVzZWQoKTtcbiAgICB2YXIgdXJsUGFyYW1zID0gbm9uUG9zaXRpb25hbFBhcmFtcztcblxuICAgIHJldHVybiBuZXcgR2VuZXJhdGVkVXJsKHVybFBhdGgsIHVybFBhcmFtcyk7XG4gIH1cblxuXG4gIHRvU3RyaW5nKCk6IHN0cmluZyB7IHJldHVybiB0aGlzLnJvdXRlUGF0aDsgfVxuXG4gIHByaXZhdGUgX3BhcnNlUGF0aFN0cmluZyhyb3V0ZVBhdGg6IHN0cmluZykge1xuICAgIC8vIG5vcm1hbGl6ZSByb3V0ZSBhcyBub3Qgc3RhcnRpbmcgd2l0aCBhIFwiL1wiLiBSZWNvZ25pdGlvbiB3aWxsXG4gICAgLy8gYWxzbyBub3JtYWxpemUuXG4gICAgaWYgKHJvdXRlUGF0aC5zdGFydHNXaXRoKFwiL1wiKSkge1xuICAgICAgcm91dGVQYXRoID0gcm91dGVQYXRoLnN1YnN0cmluZygxKTtcbiAgICB9XG5cbiAgICB2YXIgc2VnbWVudFN0cmluZ3MgPSByb3V0ZVBhdGguc3BsaXQoJy8nKTtcbiAgICB0aGlzLl9zZWdtZW50cyA9IFtdO1xuXG4gICAgdmFyIGxpbWl0ID0gc2VnbWVudFN0cmluZ3MubGVuZ3RoIC0gMTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8PSBsaW1pdDsgaSsrKSB7XG4gICAgICB2YXIgc2VnbWVudCA9IHNlZ21lbnRTdHJpbmdzW2ldLCBtYXRjaDtcblxuICAgICAgaWYgKGlzUHJlc2VudChtYXRjaCA9IFJlZ0V4cFdyYXBwZXIuZmlyc3RNYXRjaChEeW5hbWljUGF0aFNlZ21lbnQucGFyYW1NYXRjaGVyLCBzZWdtZW50KSkpIHtcbiAgICAgICAgdGhpcy5fc2VnbWVudHMucHVzaChuZXcgRHluYW1pY1BhdGhTZWdtZW50KG1hdGNoWzFdKSk7XG4gICAgICB9IGVsc2UgaWYgKGlzUHJlc2VudChcbiAgICAgICAgICAgICAgICAgICAgIG1hdGNoID0gUmVnRXhwV3JhcHBlci5maXJzdE1hdGNoKFN0YXJQYXRoU2VnbWVudC53aWxkY2FyZE1hdGNoZXIsIHNlZ21lbnQpKSkge1xuICAgICAgICB0aGlzLl9zZWdtZW50cy5wdXNoKG5ldyBTdGFyUGF0aFNlZ21lbnQobWF0Y2hbMV0pKTtcbiAgICAgIH0gZWxzZSBpZiAoc2VnbWVudCA9PSAnLi4uJykge1xuICAgICAgICBpZiAoaSA8IGxpbWl0KSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEJhc2VFeGNlcHRpb24oXG4gICAgICAgICAgICAgIGBVbmV4cGVjdGVkIFwiLi4uXCIgYmVmb3JlIHRoZSBlbmQgb2YgdGhlIHBhdGggZm9yIFwiJHtyb3V0ZVBhdGh9XCIuYCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fc2VnbWVudHMucHVzaChuZXcgQ29udGludWF0aW9uUGF0aFNlZ21lbnQoKSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl9zZWdtZW50cy5wdXNoKG5ldyBTdGF0aWNQYXRoU2VnbWVudChzZWdtZW50KSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfY2FsY3VsYXRlU3BlY2lmaWNpdHkoKTogc3RyaW5nIHtcbiAgICAvLyBUaGUgXCJzcGVjaWZpY2l0eVwiIG9mIGEgcGF0aCBpcyB1c2VkIHRvIGRldGVybWluZSB3aGljaCByb3V0ZSBpcyB1c2VkIHdoZW4gbXVsdGlwbGUgcm91dGVzXG4gICAgLy8gbWF0Y2hcbiAgICAvLyBhIFVSTC4gU3RhdGljIHNlZ21lbnRzIChsaWtlIFwiL2Zvb1wiKSBhcmUgdGhlIG1vc3Qgc3BlY2lmaWMsIGZvbGxvd2VkIGJ5IGR5bmFtaWMgc2VnbWVudHNcbiAgICAvLyAobGlrZVxuICAgIC8vIFwiLzppZFwiKS4gU3RhciBzZWdtZW50cyBhZGQgbm8gc3BlY2lmaWNpdHkuIFNlZ21lbnRzIGF0IHRoZSBzdGFydCBvZiB0aGUgcGF0aCBhcmUgbW9yZVxuICAgIC8vIHNwZWNpZmljXG4gICAgLy8gdGhhbiBwcm9jZWVkaW5nIG9uZXMuXG4gICAgLy9cbiAgICAvLyBUaGUgY29kZSBiZWxvdyB1c2VzIHBsYWNlIHZhbHVlcyB0byBjb21iaW5lIHRoZSBkaWZmZXJlbnQgdHlwZXMgb2Ygc2VnbWVudHMgaW50byBhIHNpbmdsZVxuICAgIC8vIHN0cmluZyB0aGF0IHdlIGNhbiBzb3J0IGxhdGVyLiBFYWNoIHN0YXRpYyBzZWdtZW50IGlzIG1hcmtlZCBhcyBhIHNwZWNpZmljaXR5IG9mIFwiMixcIiBlYWNoXG4gICAgLy8gZHluYW1pYyBzZWdtZW50IGlzIHdvcnRoIFwiMVwiIHNwZWNpZmljaXR5LCBhbmQgc3RhcnMgYXJlIHdvcnRoIFwiMFwiIHNwZWNpZmljaXR5LlxuICAgIHZhciBpLCBsZW5ndGggPSB0aGlzLl9zZWdtZW50cy5sZW5ndGgsIHNwZWNpZmljaXR5O1xuICAgIGlmIChsZW5ndGggPT0gMCkge1xuICAgICAgLy8gYSBzaW5nbGUgc2xhc2ggKG9yIFwiZW1wdHkgc2VnbWVudFwiIGlzIGFzIHNwZWNpZmljIGFzIGEgc3RhdGljIHNlZ21lbnRcbiAgICAgIHNwZWNpZmljaXR5ICs9ICcyJztcbiAgICB9IGVsc2Uge1xuICAgICAgc3BlY2lmaWNpdHkgPSAnJztcbiAgICAgIGZvciAoaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICBzcGVjaWZpY2l0eSArPSB0aGlzLl9zZWdtZW50c1tpXS5zcGVjaWZpY2l0eTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHNwZWNpZmljaXR5O1xuICB9XG5cbiAgcHJpdmF0ZSBfY2FsY3VsYXRlSGFzaCgpOiBzdHJpbmcge1xuICAgIC8vIHRoaXMgZnVuY3Rpb24gaXMgdXNlZCB0byBkZXRlcm1pbmUgd2hldGhlciBhIHJvdXRlIGNvbmZpZyBwYXRoIGxpa2UgYC9mb28vOmlkYCBjb2xsaWRlcyB3aXRoXG4gICAgLy8gYC9mb28vOm5hbWVgXG4gICAgdmFyIGksIGxlbmd0aCA9IHRoaXMuX3NlZ21lbnRzLmxlbmd0aDtcbiAgICB2YXIgaGFzaFBhcnRzID0gW107XG4gICAgZm9yIChpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICBoYXNoUGFydHMucHVzaCh0aGlzLl9zZWdtZW50c1tpXS5oYXNoKTtcbiAgICB9XG4gICAgcmV0dXJuIGhhc2hQYXJ0cy5qb2luKCcvJyk7XG4gIH1cblxuICBwcml2YXRlIF9hc3NlcnRWYWxpZFBhdGgocGF0aDogc3RyaW5nKSB7XG4gICAgaWYgKFN0cmluZ1dyYXBwZXIuY29udGFpbnMocGF0aCwgJyMnKSkge1xuICAgICAgdGhyb3cgbmV3IEJhc2VFeGNlcHRpb24oXG4gICAgICAgICAgYFBhdGggXCIke3BhdGh9XCIgc2hvdWxkIG5vdCBpbmNsdWRlIFwiI1wiLiBVc2UgXCJIYXNoTG9jYXRpb25TdHJhdGVneVwiIGluc3RlYWQuYCk7XG4gICAgfVxuICAgIHZhciBpbGxlZ2FsQ2hhcmFjdGVyID0gUmVnRXhwV3JhcHBlci5maXJzdE1hdGNoKFBhcmFtUm91dGVQYXRoLlJFU0VSVkVEX0NIQVJTLCBwYXRoKTtcbiAgICBpZiAoaXNQcmVzZW50KGlsbGVnYWxDaGFyYWN0ZXIpKSB7XG4gICAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbihcbiAgICAgICAgICBgUGF0aCBcIiR7cGF0aH1cIiBjb250YWlucyBcIiR7aWxsZWdhbENoYXJhY3RlclswXX1cIiB3aGljaCBpcyBub3QgYWxsb3dlZCBpbiBhIHJvdXRlIGNvbmZpZy5gKTtcbiAgICB9XG4gIH1cbiAgc3RhdGljIFJFU0VSVkVEX0NIQVJTID0gUmVnRXhwV3JhcHBlci5jcmVhdGUoJy8vfFxcXFwofFxcXFwpfDt8XFxcXD98PScpO1xufVxuXG5sZXQgUkVHRVhQX1BFUkNFTlQgPSAvJS9nO1xubGV0IFJFR0VYUF9TTEFTSCA9IC9cXC8vZztcbmxldCBSRUdFWFBfT1BFTl9QQVJFTlQgPSAvXFwoL2c7XG5sZXQgUkVHRVhQX0NMT1NFX1BBUkVOVCA9IC9cXCkvZztcbmxldCBSRUdFWFBfU0VNSUNPTE9OID0gLzsvZztcblxuZnVuY3Rpb24gZW5jb2RlRHluYW1pY1NlZ21lbnQodmFsdWU6IHN0cmluZyk6IHN0cmluZyB7XG4gIGlmIChpc0JsYW5rKHZhbHVlKSkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgdmFsdWUgPSBTdHJpbmdXcmFwcGVyLnJlcGxhY2VBbGwodmFsdWUsIFJFR0VYUF9QRVJDRU5ULCAnJTI1Jyk7XG4gIHZhbHVlID0gU3RyaW5nV3JhcHBlci5yZXBsYWNlQWxsKHZhbHVlLCBSRUdFWFBfU0xBU0gsICclMkYnKTtcbiAgdmFsdWUgPSBTdHJpbmdXcmFwcGVyLnJlcGxhY2VBbGwodmFsdWUsIFJFR0VYUF9PUEVOX1BBUkVOVCwgJyUyOCcpO1xuICB2YWx1ZSA9IFN0cmluZ1dyYXBwZXIucmVwbGFjZUFsbCh2YWx1ZSwgUkVHRVhQX0NMT1NFX1BBUkVOVCwgJyUyOScpO1xuICB2YWx1ZSA9IFN0cmluZ1dyYXBwZXIucmVwbGFjZUFsbCh2YWx1ZSwgUkVHRVhQX1NFTUlDT0xPTiwgJyUzQicpO1xuXG4gIHJldHVybiB2YWx1ZTtcbn1cblxubGV0IFJFR0VYUF9FTkNfU0VNSUNPTE9OID0gLyUzQi9pZztcbmxldCBSRUdFWFBfRU5DX0NMT1NFX1BBUkVOVCA9IC8lMjkvaWc7XG5sZXQgUkVHRVhQX0VOQ19PUEVOX1BBUkVOVCA9IC8lMjgvaWc7XG5sZXQgUkVHRVhQX0VOQ19TTEFTSCA9IC8lMkYvaWc7XG5sZXQgUkVHRVhQX0VOQ19QRVJDRU5UID0gLyUyNS9pZztcblxuZnVuY3Rpb24gZGVjb2RlRHluYW1pY1NlZ21lbnQodmFsdWU6IHN0cmluZyk6IHN0cmluZyB7XG4gIGlmIChpc0JsYW5rKHZhbHVlKSkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgdmFsdWUgPSBTdHJpbmdXcmFwcGVyLnJlcGxhY2VBbGwodmFsdWUsIFJFR0VYUF9FTkNfU0VNSUNPTE9OLCAnOycpO1xuICB2YWx1ZSA9IFN0cmluZ1dyYXBwZXIucmVwbGFjZUFsbCh2YWx1ZSwgUkVHRVhQX0VOQ19DTE9TRV9QQVJFTlQsICcpJyk7XG4gIHZhbHVlID0gU3RyaW5nV3JhcHBlci5yZXBsYWNlQWxsKHZhbHVlLCBSRUdFWFBfRU5DX09QRU5fUEFSRU5ULCAnKCcpO1xuICB2YWx1ZSA9IFN0cmluZ1dyYXBwZXIucmVwbGFjZUFsbCh2YWx1ZSwgUkVHRVhQX0VOQ19TTEFTSCwgJy8nKTtcbiAgdmFsdWUgPSBTdHJpbmdXcmFwcGVyLnJlcGxhY2VBbGwodmFsdWUsIFJFR0VYUF9FTkNfUEVSQ0VOVCwgJyUnKTtcblxuICByZXR1cm4gdmFsdWU7XG59XG4iXX0=