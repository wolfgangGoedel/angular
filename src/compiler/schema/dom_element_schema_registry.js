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
var di_1 = require('angular2/src/core/di');
var lang_1 = require('angular2/src/facade/lang');
var collection_1 = require('angular2/src/facade/collection');
var EVENT = 'event';
var BOOLEAN = 'boolean';
var NUMBER = 'number';
var STRING = 'string';
var OBJECT = 'object';
/**
 * This array represents the DOM schema. It encodes inheritance, properties, and events.
 *
 * ## Overview
 *
 * Each line represents one kind of element. The `element_inheritance` and properties are joined
 * using `element_inheritance|preperties` syntax.
 *
 * ## Element Inheritance
 *
 * The `element_inheritance` can be further subdivided as `element1,element2,...^parentElement`.
 * Here the individual elements are separated by `,` (commas). Every element in the list
 * has identical properties.
 *
 * An `element` may inherit additional properties from `parentElement` If no `^parentElement` is
 * specified then `""` (blank) element is assumed.
 *
 * NOTE: The blank element inherits from root `*` element, the super element of all elements.
 *
 * NOTE an element prefix such as `@svg:` has no special meaning to the schema.
 *
 * ## Properties
 *
 * Each element has a set of properties separated by `,` (commas). Each property can be prefixed
 * by a special character designating its type:
 *
 * - (no prefix): property is a string.
 * - `*`: property represents an event.
 * - `!`: property is a boolean.
 * - `#`: property is a number.
 * - `%`: property is an object.
 *
 * ## Query
 *
 * The class creates an internal squas representaino which allows to easily answer the query of
 * if a given property exist on a given element.
 *
 * NOTE: We don't yet support querying for types or events.
 * NOTE: This schema is auto extracted from `schema_extractor.ts` located in the test folder.
 */
var SCHEMA = lang_1.CONST_EXPR([
    '*|%classList,className,id,innerHTML,*beforecopy,*beforecut,*beforepaste,*copy,*cut,*paste,*search,*selectstart,*webkitfullscreenchange,*webkitfullscreenerror,*wheel,outerHTML,#scrollLeft,#scrollTop',
    '^*|accessKey,contentEditable,dir,!draggable,!hidden,innerText,lang,*abort,*autocomplete,*autocompleteerror,*beforecopy,*beforecut,*beforepaste,*blur,*cancel,*canplay,*canplaythrough,*change,*click,*close,*contextmenu,*copy,*cuechange,*cut,*dblclick,*drag,*dragend,*dragenter,*dragleave,*dragover,*dragstart,*drop,*durationchange,*emptied,*ended,*error,*focus,*input,*invalid,*keydown,*keypress,*keyup,*load,*loadeddata,*loadedmetadata,*loadstart,*message,*mousedown,*mouseenter,*mouseleave,*mousemove,*mouseout,*mouseover,*mouseup,*mousewheel,*mozfullscreenchange,*mozfullscreenerror,*mozpointerlockchange,*mozpointerlockerror,*paste,*pause,*play,*playing,*progress,*ratechange,*reset,*resize,*scroll,*search,*seeked,*seeking,*select,*selectstart,*show,*stalled,*submit,*suspend,*timeupdate,*toggle,*volumechange,*waiting,*webglcontextcreationerror,*webglcontextlost,*webglcontextrestored,*webkitfullscreenchange,*webkitfullscreenerror,*wheel,outerText,!spellcheck,%style,#tabIndex,title,!translate',
    'media|!autoplay,!controls,%crossOrigin,#currentTime,!defaultMuted,#defaultPlaybackRate,!disableRemotePlayback,!loop,!muted,*encrypted,#playbackRate,preload,src,#volume',
    '@svg:^*|*abort,*autocomplete,*autocompleteerror,*blur,*cancel,*canplay,*canplaythrough,*change,*click,*close,*contextmenu,*cuechange,*dblclick,*drag,*dragend,*dragenter,*dragleave,*dragover,*dragstart,*drop,*durationchange,*emptied,*ended,*error,*focus,*input,*invalid,*keydown,*keypress,*keyup,*load,*loadeddata,*loadedmetadata,*loadstart,*mousedown,*mouseenter,*mouseleave,*mousemove,*mouseout,*mouseover,*mouseup,*mousewheel,*pause,*play,*playing,*progress,*ratechange,*reset,*resize,*scroll,*seeked,*seeking,*select,*show,*stalled,*submit,*suspend,*timeupdate,*toggle,*volumechange,*waiting,%style,#tabIndex',
    '@svg:graphics^@svg:|',
    '@svg:animation^@svg:|*begin,*end,*repeat',
    '@svg:geometry^@svg:|',
    '@svg:componentTransferFunction^@svg:|',
    '@svg:gradient^@svg:|',
    '@svg:textContent^@svg:graphics|',
    '@svg:textPositioning^@svg:textContent|',
    'a|charset,coords,download,hash,host,hostname,href,hreflang,name,password,pathname,ping,port,protocol,rel,rev,search,shape,target,text,type,username',
    'area|alt,coords,hash,host,hostname,href,!noHref,password,pathname,ping,port,protocol,search,shape,target,username',
    'audio^media|',
    'br|clear',
    'base|href,target',
    'body|aLink,background,bgColor,link,*beforeunload,*blur,*error,*focus,*hashchange,*languagechange,*load,*message,*offline,*online,*pagehide,*pageshow,*popstate,*rejectionhandled,*resize,*scroll,*storage,*unhandledrejection,*unload,text,vLink',
    'button|!autofocus,!disabled,formAction,formEnctype,formMethod,!formNoValidate,formTarget,name,type,value',
    'canvas|#height,#width',
    'content|select',
    'dl|!compact',
    'datalist|',
    'details|!open',
    'dialog|!open,returnValue',
    'dir|!compact',
    'div|align',
    'embed|align,height,name,src,type,width',
    'fieldset|!disabled,name',
    'font|color,face,size',
    'form|acceptCharset,action,autocomplete,encoding,enctype,method,name,!noValidate,target',
    'frame|frameBorder,longDesc,marginHeight,marginWidth,name,!noResize,scrolling,src',
    'frameset|cols,*beforeunload,*blur,*error,*focus,*hashchange,*languagechange,*load,*message,*offline,*online,*pagehide,*pageshow,*popstate,*rejectionhandled,*resize,*scroll,*storage,*unhandledrejection,*unload,rows',
    'hr|align,color,!noShade,size,width',
    'head|',
    'h1,h2,h3,h4,h5,h6|align',
    'html|version',
    'iframe|align,!allowFullscreen,frameBorder,height,longDesc,marginHeight,marginWidth,name,%sandbox,scrolling,src,srcdoc,width',
    'img|align,alt,border,%crossOrigin,#height,#hspace,!isMap,longDesc,lowsrc,name,sizes,src,srcset,useMap,#vspace,#width',
    'input|accept,align,alt,autocapitalize,autocomplete,!autofocus,!checked,!defaultChecked,defaultValue,dirName,!disabled,%files,formAction,formEnctype,formMethod,!formNoValidate,formTarget,#height,!incremental,!indeterminate,max,#maxLength,min,#minLength,!multiple,name,pattern,placeholder,!readOnly,!required,selectionDirection,#selectionEnd,#selectionStart,#size,src,step,type,useMap,value,%valueAsDate,#valueAsNumber,#width',
    'keygen|!autofocus,challenge,!disabled,keytype,name',
    'li|type,#value',
    'label|htmlFor',
    'legend|align',
    'link|as,charset,%crossOrigin,!disabled,href,hreflang,integrity,media,rel,%relList,rev,%sizes,target,type',
    'map|name',
    'marquee|behavior,bgColor,direction,height,#hspace,#loop,#scrollAmount,#scrollDelay,!trueSpeed,#vspace,width',
    'menu|!compact',
    'meta|content,httpEquiv,name,scheme',
    'meter|#high,#low,#max,#min,#optimum,#value',
    'ins,del|cite,dateTime',
    'ol|!compact,!reversed,#start,type',
    'object|align,archive,border,code,codeBase,codeType,data,!declare,height,#hspace,name,standby,type,useMap,#vspace,width',
    'optgroup|!disabled,label',
    'option|!defaultSelected,!disabled,label,!selected,text,value',
    'output|defaultValue,%htmlFor,name,value',
    'p|align',
    'param|name,type,value,valueType',
    'picture|',
    'pre|#width',
    'progress|#max,#value',
    'q,blockquote,cite|',
    'script|!async,charset,%crossOrigin,!defer,event,htmlFor,integrity,src,text,type',
    'select|!autofocus,!disabled,#length,!multiple,name,!required,#selectedIndex,#size,value',
    'shadow|',
    'source|media,sizes,src,srcset,type',
    'span|',
    'style|!disabled,media,type',
    'caption|align',
    'th,td|abbr,align,axis,bgColor,ch,chOff,#colSpan,headers,height,!noWrap,#rowSpan,scope,vAlign,width',
    'col,colgroup|align,ch,chOff,#span,vAlign,width',
    'table|align,bgColor,border,%caption,cellPadding,cellSpacing,frame,rules,summary,%tFoot,%tHead,width',
    'tr|align,bgColor,ch,chOff,vAlign',
    'tfoot,thead,tbody|align,ch,chOff,vAlign',
    'template|',
    'textarea|autocapitalize,!autofocus,#cols,defaultValue,dirName,!disabled,#maxLength,#minLength,name,placeholder,!readOnly,!required,#rows,selectionDirection,#selectionEnd,#selectionStart,value,wrap',
    'title|text',
    'track|!default,kind,label,src,srclang',
    'ul|!compact,type',
    'unknown|',
    'video^media|#height,poster,#width',
    '@svg:a^@svg:graphics|',
    '@svg:animate^@svg:animation|',
    '@svg:animateMotion^@svg:animation|',
    '@svg:animateTransform^@svg:animation|',
    '@svg:circle^@svg:geometry|',
    '@svg:clipPath^@svg:graphics|',
    '@svg:cursor^@svg:|',
    '@svg:defs^@svg:graphics|',
    '@svg:desc^@svg:|',
    '@svg:discard^@svg:|',
    '@svg:ellipse^@svg:geometry|',
    '@svg:feBlend^@svg:|',
    '@svg:feColorMatrix^@svg:|',
    '@svg:feComponentTransfer^@svg:|',
    '@svg:feComposite^@svg:|',
    '@svg:feConvolveMatrix^@svg:|',
    '@svg:feDiffuseLighting^@svg:|',
    '@svg:feDisplacementMap^@svg:|',
    '@svg:feDistantLight^@svg:|',
    '@svg:feDropShadow^@svg:|',
    '@svg:feFlood^@svg:|',
    '@svg:feFuncA^@svg:componentTransferFunction|',
    '@svg:feFuncB^@svg:componentTransferFunction|',
    '@svg:feFuncG^@svg:componentTransferFunction|',
    '@svg:feFuncR^@svg:componentTransferFunction|',
    '@svg:feGaussianBlur^@svg:|',
    '@svg:feImage^@svg:|',
    '@svg:feMerge^@svg:|',
    '@svg:feMergeNode^@svg:|',
    '@svg:feMorphology^@svg:|',
    '@svg:feOffset^@svg:|',
    '@svg:fePointLight^@svg:|',
    '@svg:feSpecularLighting^@svg:|',
    '@svg:feSpotLight^@svg:|',
    '@svg:feTile^@svg:|',
    '@svg:feTurbulence^@svg:|',
    '@svg:filter^@svg:|',
    '@svg:foreignObject^@svg:graphics|',
    '@svg:g^@svg:graphics|',
    '@svg:image^@svg:graphics|',
    '@svg:line^@svg:geometry|',
    '@svg:linearGradient^@svg:gradient|',
    '@svg:mpath^@svg:|',
    '@svg:marker^@svg:|',
    '@svg:mask^@svg:|',
    '@svg:metadata^@svg:|',
    '@svg:path^@svg:geometry|',
    '@svg:pattern^@svg:|',
    '@svg:polygon^@svg:geometry|',
    '@svg:polyline^@svg:geometry|',
    '@svg:radialGradient^@svg:gradient|',
    '@svg:rect^@svg:geometry|',
    '@svg:svg^@svg:graphics|#currentScale,#zoomAndPan',
    '@svg:script^@svg:|type',
    '@svg:set^@svg:animation|',
    '@svg:stop^@svg:|',
    '@svg:style^@svg:|!disabled,media,title,type',
    '@svg:switch^@svg:graphics|',
    '@svg:symbol^@svg:|',
    '@svg:tspan^@svg:textPositioning|',
    '@svg:text^@svg:textPositioning|',
    '@svg:textPath^@svg:textContent|',
    '@svg:title^@svg:|',
    '@svg:use^@svg:graphics|',
    '@svg:view^@svg:|#zoomAndPan'
]);
var attrToPropMap = {
    'class': 'className',
    'innerHtml': 'innerHTML',
    'readonly': 'readOnly',
    'tabindex': 'tabIndex'
};
var DomElementSchemaRegistry = (function () {
    function DomElementSchemaRegistry() {
        var _this = this;
        this.schema = {};
        SCHEMA.forEach(function (encodedType) {
            var parts = encodedType.split('|');
            var properties = parts[1].split(',');
            var typeParts = (parts[0] + '^').split('^');
            var typeName = typeParts[0];
            var type = {};
            typeName.split(',').forEach(function (tag) { return _this.schema[tag] = type; });
            var superType = _this.schema[typeParts[1]];
            if (lang_1.isPresent(superType)) {
                collection_1.StringMapWrapper.forEach(superType, function (v, k) { return type[k] = v; });
            }
            properties.forEach(function (property) {
                if (property == '') {
                }
                else if (property.startsWith('*')) {
                }
                else if (property.startsWith('!')) {
                    type[property.substring(1)] = BOOLEAN;
                }
                else if (property.startsWith('#')) {
                    type[property.substring(1)] = NUMBER;
                }
                else if (property.startsWith('%')) {
                    type[property.substring(1)] = OBJECT;
                }
                else {
                    type[property] = STRING;
                }
            });
        });
    }
    DomElementSchemaRegistry.prototype.hasProperty = function (tagName, propName) {
        if (tagName.indexOf('-') !== -1) {
            // can't tell now as we don't know which properties a custom element will get
            // once it is instantiated
            return true;
        }
        else {
            var elementProperties = this.schema[tagName.toLowerCase()];
            if (!lang_1.isPresent(elementProperties)) {
                elementProperties = this.schema['unknown'];
            }
            return lang_1.isPresent(elementProperties[propName]);
        }
    };
    DomElementSchemaRegistry.prototype.getMappedPropName = function (propName) {
        var mappedPropName = collection_1.StringMapWrapper.get(attrToPropMap, propName);
        return lang_1.isPresent(mappedPropName) ? mappedPropName : propName;
    };
    DomElementSchemaRegistry = __decorate([
        di_1.Injectable(), 
        __metadata('design:paramtypes', [])
    ], DomElementSchemaRegistry);
    return DomElementSchemaRegistry;
}());
exports.DomElementSchemaRegistry = DomElementSchemaRegistry;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZG9tX2VsZW1lbnRfc2NoZW1hX3JlZ2lzdHJ5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZGlmZmluZ19wbHVnaW5fd3JhcHBlci1vdXRwdXRfcGF0aC1pZ0Eyc2NtYS50bXAvYW5ndWxhcjIvc3JjL2NvbXBpbGVyL3NjaGVtYS9kb21fZWxlbWVudF9zY2hlbWFfcmVnaXN0cnkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFBLG1CQUF5QixzQkFBc0IsQ0FBQyxDQUFBO0FBQ2hELHFCQUFvQywwQkFBMEIsQ0FBQyxDQUFBO0FBQy9ELDJCQUErQixnQ0FBZ0MsQ0FBQyxDQUFBO0FBR2hFLElBQU0sS0FBSyxHQUFHLE9BQU8sQ0FBQztBQUN0QixJQUFNLE9BQU8sR0FBRyxTQUFTLENBQUM7QUFDMUIsSUFBTSxNQUFNLEdBQUcsUUFBUSxDQUFDO0FBQ3hCLElBQU0sTUFBTSxHQUFHLFFBQVEsQ0FBQztBQUN4QixJQUFNLE1BQU0sR0FBRyxRQUFRLENBQUM7QUFFeEI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQXVDRztBQUNILElBQU0sTUFBTSxHQUNSLGlCQUFVLENBQUM7SUFDVCx1TUFBdU07SUFDdk0sdytCQUF3K0I7SUFDeCtCLHlLQUF5SztJQUN6SyxxbUJBQXFtQjtJQUNybUIsc0JBQXNCO0lBQ3RCLDBDQUEwQztJQUMxQyxzQkFBc0I7SUFDdEIsdUNBQXVDO0lBQ3ZDLHNCQUFzQjtJQUN0QixpQ0FBaUM7SUFDakMsd0NBQXdDO0lBQ3hDLHFKQUFxSjtJQUNySixtSEFBbUg7SUFDbkgsY0FBYztJQUNkLFVBQVU7SUFDVixrQkFBa0I7SUFDbEIsa1BBQWtQO0lBQ2xQLDBHQUEwRztJQUMxRyx1QkFBdUI7SUFDdkIsZ0JBQWdCO0lBQ2hCLGFBQWE7SUFDYixXQUFXO0lBQ1gsZUFBZTtJQUNmLDBCQUEwQjtJQUMxQixjQUFjO0lBQ2QsV0FBVztJQUNYLHdDQUF3QztJQUN4Qyx5QkFBeUI7SUFD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QUMsQ0FBQyxDQUFDO1FBQ2hELENBQUM7SUFDSCxDQUFDO0lBRUQsb0RBQWlCLEdBQWpCLFVBQWtCLFFBQWdCO1FBQ2hDLElBQUksY0FBYyxHQUFHLDZCQUFnQixDQUFDLEdBQUcsQ0FBQyxhQUFhLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFDbkUsTUFBTSxDQUFDLGdCQUFTLENBQUMsY0FBYyxDQUFDLEdBQUcsY0FBYyxHQUFHLFFBQVEsQ0FBQztJQUMvRCxDQUFDO0lBbkRIO1FBQUMsZUFBVSxFQUFFOztnQ0FBQTtJQW9EYiwrQkFBQztBQUFELENBQUMsQUFuREQsSUFtREM7QUFuRFksZ0NBQXdCLDJCQW1EcEMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7SW5qZWN0YWJsZX0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvZGknO1xuaW1wb3J0IHtpc1ByZXNlbnQsIENPTlNUX0VYUFJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge1N0cmluZ01hcFdyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvY29sbGVjdGlvbic7XG5pbXBvcnQge0VsZW1lbnRTY2hlbWFSZWdpc3RyeX0gZnJvbSAnLi9lbGVtZW50X3NjaGVtYV9yZWdpc3RyeSc7XG5cbmNvbnN0IEVWRU5UID0gJ2V2ZW50JztcbmNvbnN0IEJPT0xFQU4gPSAnYm9vbGVhbic7XG5jb25zdCBOVU1CRVIgPSAnbnVtYmVyJztcbmNvbnN0IFNUUklORyA9ICdzdHJpbmcnO1xuY29uc3QgT0JKRUNUID0gJ29iamVjdCc7XG5cbi8qKlxuICogVGhpcyBhcnJheSByZXByZXNlbnRzIHRoZSBET00gc2NoZW1hLiBJdCBlbmNvZGVzIGluaGVyaXRhbmNlLCBwcm9wZXJ0aWVzLCBhbmQgZXZlbnRzLlxuICpcbiAqICMjIE92ZXJ2aWV3XG4gKlxuICogRWFjaCBsaW5lIHJlcHJlc2VudHMgb25lIGtpbmQgb2YgZWxlbWVudC4gVGhlIGBlbGVtZW50X2luaGVyaXRhbmNlYCBhbmQgcHJvcGVydGllcyBhcmUgam9pbmVkXG4gKiB1c2luZyBgZWxlbWVudF9pbmhlcml0YW5jZXxwcmVwZXJ0aWVzYCBzeW50YXguXG4gKlxuICogIyMgRWxlbWVudCBJbmhlcml0YW5jZVxuICpcbiAqIFRoZSBgZWxlbWVudF9pbmhlcml0YW5jZWAgY2FuIGJlIGZ1cnRoZXIgc3ViZGl2aWRlZCBhcyBgZWxlbWVudDEsZWxlbWVudDIsLi4uXnBhcmVudEVsZW1lbnRgLlxuICogSGVyZSB0aGUgaW5kaXZpZHVhbCBlbGVtZW50cyBhcmUgc2VwYXJhdGVkIGJ5IGAsYCAoY29tbWFzKS4gRXZlcnkgZWxlbWVudCBpbiB0aGUgbGlzdFxuICogaGFzIGlkZW50aWNhbCBwcm9wZXJ0aWVzLlxuICpcbiAqIEFuIGBlbGVtZW50YCBtYXkgaW5oZXJpdCBhZGRpdGlvbmFsIHByb3BlcnRpZXMgZnJvbSBgcGFyZW50RWxlbWVudGAgSWYgbm8gYF5wYXJlbnRFbGVtZW50YCBpc1xuICogc3BlY2lmaWVkIHRoZW4gYFwiXCJgIChibGFuaykgZWxlbWVudCBpcyBhc3N1bWVkLlxuICpcbiAqIE5PVEU6IFRoZSBibGFuayBlbGVtZW50IGluaGVyaXRzIGZyb20gcm9vdCBgKmAgZWxlbWVudCwgdGhlIHN1cGVyIGVsZW1lbnQgb2YgYWxsIGVsZW1lbnRzLlxuICpcbiAqIE5PVEUgYW4gZWxlbWVudCBwcmVmaXggc3VjaCBhcyBgQHN2ZzpgIGhhcyBubyBzcGVjaWFsIG1lYW5pbmcgdG8gdGhlIHNjaGVtYS5cbiAqXG4gKiAjIyBQcm9wZXJ0aWVzXG4gKlxuICogRWFjaCBlbGVtZW50IGhhcyBhIHNldCBvZiBwcm9wZXJ0aWVzIHNlcGFyYXRlZCBieSBgLGAgKGNvbW1hcykuIEVhY2ggcHJvcGVydHkgY2FuIGJlIHByZWZpeGVkXG4gKiBieSBhIHNwZWNpYWwgY2hhcmFjdGVyIGRlc2lnbmF0aW5nIGl0cyB0eXBlOlxuICpcbiAqIC0gKG5vIHByZWZpeCk6IHByb3BlcnR5IGlzIGEgc3RyaW5nLlxuICogLSBgKmA6IHByb3BlcnR5IHJlcHJlc2VudHMgYW4gZXZlbnQuXG4gKiAtIGAhYDogcHJvcGVydHkgaXMgYSBib29sZWFuLlxuICogLSBgI2A6IHByb3BlcnR5IGlzIGEgbnVtYmVyLlxuICogLSBgJWA6IHByb3BlcnR5IGlzIGFuIG9iamVjdC5cbiAqXG4gKiAjIyBRdWVyeVxuICpcbiAqIFRoZSBjbGFzcyBjcmVhdGVzIGFuIGludGVybmFsIHNxdWFzIHJlcHJlc2VudGFpbm8gd2hpY2ggYWxsb3dzIHRvIGVhc2lseSBhbnN3ZXIgdGhlIHF1ZXJ5IG9mXG4gKiBpZiBhIGdpdmVuIHByb3BlcnR5IGV4aXN0IG9uIGEgZ2l2ZW4gZWxlbWVudC5cbiAqXG4gKiBOT1RFOiBXZSBkb24ndCB5ZXQgc3VwcG9ydCBxdWVyeWluZyBmb3IgdHlwZXMgb3IgZXZlbnRzLlxuICogTk9URTogVGhpcyBzY2hlbWEgaXMgYXV0byBleHRyYWN0ZWQgZnJvbSBgc2NoZW1hX2V4dHJhY3Rvci50c2AgbG9jYXRlZCBpbiB0aGUgdGVzdCBmb2xkZXIuXG4gKi9cbmNvbnN0IFNDSEVNQTogc3RyaW5nW10gPVxuICAgIENPTlNUX0VYUFIoW1xuICAgICAgJyp8JWNsYXNzTGlzdCxjbGFzc05hbWUsaWQsaW5uZXJIVE1MLCpiZWZvcmVjb3B5LCpiZWZvcmVjdXQsKmJlZm9yZXBhc3RlLCpjb3B5LCpjdXQsKnBhc3RlLCpzZWFyY2gsKnNlbGVjdHN0YXJ0LCp3ZWJraXRmdWxsc2NyZWVuY2hhbmdlLCp3ZWJraXRmdWxsc2NyZWVuZXJyb3IsKndoZWVsLG91dGVySFRNTCwjc2Nyb2xsTGVmdCwjc2Nyb2xsVG9wJyxcbiAgICAgICdeKnxhY2Nlc3NLZXksY29udGVudEVkaXRhYmxlLGRpciwhZHJhZ2dhYmxlLCFoaWRkZW4saW5uZXJUZXh0LGxhbmcsKmFib3J0LCphdXRvY29tcGxldGUsKmF1dG9jb21wbGV0ZWVycm9yLCpiZWZvcmVjb3B5LCpiZWZvcmVjdXQsKmJlZm9yZXBhc3RlLCpibHVyLCpjYW5jZWwsKmNhbnBsYXksKmNhbnBsYXl0aHJvdWdoLCpjaGFuZ2UsKmNsaWNrLCpjbG9zZSwqY29udGV4dG1lbnUsKmNvcHksKmN1ZWNoYW5nZSwqY3V0LCpkYmxjbGljaywqZHJhZywqZHJhZ2VuZCwqZHJhZ2VudGVyLCpkcmFnbGVhdmUsKmRyYWdvdmVyLCpkcmFnc3RhcnQsKmRyb3AsKmR1cmF0aW9uY2hhbmdlLCplbXB0aWVkLCplbmRlZCwqZXJyb3IsKmZvY3VzLCppbnB1dCwqaW52YWxpZCwqa2V5ZG93biwqa2V5cHJlc3MsKmtleXVwLCpsb2FkLCpsb2FkZWRkYXRhLCpsb2FkZWRtZXRhZGF0YSwqbG9hZHN0YXJ0LCptZXNzYWdlLCptb3VzZWRvd24sKm1vdXNlZW50ZXIsKm1vdXNlbGVhdmUsKm1vdXNlbW92ZSwqbW91c2VvdXQsKm1vdXNlb3ZlciwqbW91c2V1cCwqbW91c2V3aGVlbCwqbW96ZnVsbHNjcmVlbmNoYW5nZSwqbW96ZnVsbHNjcmVlbmVycm9yLCptb3pwb2ludGVybG9ja2NoYW5nZSwqbW96cG9pbnRlcmxvY2tlcnJvciwqcGFzdGUsKnBhdXNlLCpwbGF5LCpwbGF5aW5nLCpwcm9ncmVzcywqcmF0ZWNoYW5nZSwqcmVzZXQsKnJlc2l6ZSwqc2Nyb2xsLCpzZWFyY2gsKnNlZWtlZCwqc2Vla2luZywqc2VsZWN0LCpzZWxlY3RzdGFydCwqc2hvdywqc3RhbGxlZCwqc3VibWl0LCpzdXNwZW5kLCp0aW1ldXBkYXRlLCp0b2dnbGUsKnZvbHVtZWNoYW5nZSwqd2FpdGluZywqd2ViZ2xjb250ZXh0Y3JlYXRpb25lcnJvciwqd2ViZ2xjb250ZXh0bG9zdCwqd2ViZ2xjb250ZXh0cmVzdG9yZWQsKndlYmtpdGZ1bGxzY3JlZW5jaGFuZ2UsKndlYmtpdGZ1bGxzY3JlZW5lcnJvciwqd2hlZWwsb3V0ZXJUZXh0LCFzcGVsbGNoZWNrLCVzdHlsZSwjdGFiSW5kZXgsdGl0bGUsIXRyYW5zbGF0ZScsXG4gICAgICAnbWVkaWF8IWF1dG9wbGF5LCFjb250cm9scywlY3Jvc3NPcmlnaW4sI2N1cnJlbnRUaW1lLCFkZWZhdWx0TXV0ZWQsI2RlZmF1bHRQbGF5YmFja1JhdGUsIWRpc2FibGVSZW1vdGVQbGF5YmFjaywhbG9vcCwhbXV0ZWQsKmVuY3J5cHRlZCwjcGxheWJhY2tSYXRlLHByZWxvYWQsc3JjLCN2b2x1bWUnLFxuICAgICAgJ0Bzdmc6Xip8KmFib3J0LCphdXRvY29tcGxldGUsKmF1dG9jb21wbGV0ZWVycm9yLCpibHVyLCpjYW5jZWwsKmNhbnBsYXksKmNhbnBsYXl0aHJvdWdoLCpjaGFuZ2UsKmNsaWNrLCpjbG9zZSwqY29udGV4dG1lbnUsKmN1ZWNoYW5nZSwqZGJsY2xpY2ssKmRyYWcsKmRyYWdlbmQsKmRyYWdlbnRlciwqZHJhZ2xlYXZlLCpkcmFnb3ZlciwqZHJhZ3N0YXJ0LCpkcm9wLCpkdXJhdGlvbmNoYW5nZSwqZW1wdGllZCwqZW5kZWQsKmVycm9yLCpmb2N1cywqaW5wdXQsKmludmFsaWQsKmtleWRvd24sKmtleXByZXNzLCprZXl1cCwqbG9hZCwqbG9hZGVkZGF0YSwqbG9hZGVkbWV0YWRhdGEsKmxvYWRzdGFydCwqbW91c2Vkb3duLCptb3VzZWVudGVyLCptb3VzZWxlYXZlLCptb3VzZW1vdmUsKm1vdXNlb3V0LCptb3VzZW92ZXIsKm1vdXNldXAsKm1vdXNld2hlZWwsKnBhdXNlLCpwbGF5LCpwbGF5aW5nLCpwcm9ncmVzcywqcmF0ZWNoYW5nZSwqcmVzZXQsKnJlc2l6ZSwqc2Nyb2xsLCpzZWVrZWQsKnNlZWtpbmcsKnNlbGVjdCwqc2hvdywqc3RhbGxlZCwqc3VibWl0LCpzdXNwZW5kLCp0aW1ldXBkYXRlLCp0b2dnbGUsKnZvbHVtZWNoYW5nZSwqd2FpdGluZywlc3R5bGUsI3RhYkluZGV4JyxcbiAgICAgICdAc3ZnOmdyYXBoaWNzXkBzdmc6fCcsXG4gICAgICAnQHN2ZzphbmltYXRpb25eQHN2Zzp8KmJlZ2luLCplbmQsKnJlcGVhdCcsXG4gICAgICAnQHN2ZzpnZW9tZXRyeV5Ac3ZnOnwnLFxuICAgICAgJ0Bzdmc6Y29tcG9uZW50VHJhbnNmZXJGdW5jdGlvbl5Ac3ZnOnwnLFxuICAgICAgJ0Bzdmc6Z3JhZGllbnReQHN2Zzp8JyxcbiAgICAgICdAc3ZnOnRleHRDb250ZW50XkBzdmc6Z3JhcGhpY3N8JyxcbiAgICAgICdAc3ZnOnRleHRQb3NpdGlvbmluZ15Ac3ZnOnRleHRDb250ZW50fCcsXG4gICAgICAnYXxjaGFyc2V0LGNvb3Jkcyxkb3dubG9hZCxoYXNoLGhvc3QsaG9zdG5hbWUsaHJlZixocmVmbGFuZyxuYW1lLHBhc3N3b3JkLHBhdGhuYW1lLHBpbmcscG9ydCxwcm90b2NvbCxyZWwscmV2LHNlYXJjaCxzaGFwZSx0YXJnZXQsdGV4dCx0eXBlLHVzZXJuYW1lJyxcbiAgICAgICdhcmVhfGFsdCxjb29yZHMsaGFzaCxob3N0LGhvc3RuYW1lLGhyZWYsIW5vSHJlZixwYXNzd29yZCxwYXRobmFtZSxwaW5nLHBvcnQscHJvdG9jb2wsc2VhcmNoLHNoYXBlLHRhcmdldCx1c2VybmFtZScsXG4gICAgICAnYXVkaW9ebWVkaWF8JyxcbiAgICAgICdicnxjbGVhcicsXG4gICAgICAnYmFzZXxocmVmLHRhcmdldCcsXG4gICAgICAnYm9keXxhTGluayxiYWNrZ3JvdW5kLGJnQ29sb3IsbGluaywqYmVmb3JldW5sb2FkLCpibHVyLCplcnJvciwqZm9jdXMsKmhhc2hjaGFuZ2UsKmxhbmd1YWdlY2hhbmdlLCpsb2FkLCptZXNzYWdlLCpvZmZsaW5lLCpvbmxpbmUsKnBhZ2VoaWRlLCpwYWdlc2hvdywqcG9wc3RhdGUsKnJlamVjdGlvbmhhbmRsZWQsKnJlc2l6ZSwqc2Nyb2xsLCpzdG9yYWdlLCp1bmhhbmRsZWRyZWplY3Rpb24sKnVubG9hZCx0ZXh0LHZMaW5rJyxcbiAgICAgICdidXR0b258IWF1dG9mb2N1cywhZGlzYWJsZWQsZm9ybUFjdGlvbixmb3JtRW5jdHlwZSxmb3JtTWV0aG9kLCFmb3JtTm9WYWxpZGF0ZSxmb3JtVGFyZ2V0LG5hbWUsdHlwZSx2YWx1ZScsXG4gICAgICAnY2FudmFzfCNoZWlnaHQsI3dpZHRoJyxcbiAgICAgICdjb250ZW50fHNlbGVjdCcsXG4gICAgICAnZGx8IWNvbXBhY3QnLFxuICAgICAgJ2RhdGFsaXN0fCcsXG4gICAgICAnZGV0YWlsc3whb3BlbicsXG4gICAgICAnZGlhbG9nfCFvcGVuLHJldHVyblZhbHVlJyxcbiAgICAgICdkaXJ8IWNvbXBhY3QnLFxuICAgICAgJ2RpdnxhbGlnbicsXG4gICAgICAnZW1iZWR8YWxpZ24saGVpZ2h0LG5hbWUsc3JjLHR5cGUsd2lkdGgnLFxuICAgICAgJ2ZpZWxkc2V0fCFkaXNhYmxlZCxuYW1lJyxcbiAgICAgICdmb250fGNvbG9yLGZhY2Usc2l6ZScsXG4gICAgICAnZm9ybXxhY2NlcHRDaGFyc2V0LGFjdGlvbixhdXRvY29tcGxldGUsZW5jb2RpbmcsZW5jdHlwZSxtZXRob2QsbmFtZSwhbm9WYWxpZGF0ZSx0YXJnZXQnLFxuICAgICAgJ2ZyYW1lfGZyYW1lQm9yZGVyLGxvbmdEZXNjLG1hcmdpbkhlaWdodCxtYXJnaW5XaWR0aCxuYW1lLCFub1Jlc2l6ZSxzY3JvbGxpbmcsc3JjJyxcbiAgICAgICdmcmFtZXNldHxjb2xzLCpiZWZvcmV1bmxvYWQsKmJsdXIsKmVycm9yLCpmb2N1cywqaGFzaGNoYW5nZSwqbGFuZ3VhZ2VjaGFuZ2UsKmxvYWQsKm1lc3NhZ2UsKm9mZmxpbmUsKm9ubGluZSwqcGFnZWhpZGUsKnBhZ2VzaG93LCpwb3BzdGF0ZSwqcmVqZWN0aW9uaGFuZGxlZCwqcmVzaXplLCpzY3JvbGwsKnN0b3JhZ2UsKnVuaGFuZGxlZHJlamVjdGlvbiwqdW5sb2FkLHJvd3MnLFxuICAgICAgJ2hyfGFsaWduLGNvbG9yLCFub1NoYWRlLHNpemUsd2lkdGgnLFxuICAgICAgJ2hlYWR8JyxcbiAgICAgICdoMSxoMixoMyxoNCxoNSxoNnxhbGlnbicsXG4gICAgICAnaHRtbHx2ZXJzaW9uJyxcbiAgICAgICdpZnJhbWV8YWxpZ24sIWFsbG93RnVsbHNjcmVlbixmcmFtZUJvcmRlcixoZWlnaHQsbG9uZ0Rlc2MsbWFyZ2luSGVpZ2h0LG1hcmdpbldpZHRoLG5hbWUsJXNhbmRib3gsc2Nyb2xsaW5nLHNyYyxzcmNkb2Msd2lkdGgnLFxuICAgICAgJ2ltZ3xhbGlnbixhbHQsYm9yZGVyLCVjcm9zc09yaWdpbiwjaGVpZ2h0LCNoc3BhY2UsIWlzTWFwLGxvbmdEZXNjLGxvd3NyYyxuYW1lLHNpemVzLHNyYyxzcmNzZXQsdXNlTWFwLCN2c3BhY2UsI3dpZHRoJyxcbiAgICAgICdpbnB1dHxhY2NlcHQsYWxpZ24sYWx0LGF1dG9jYXBpdGFsaXplLGF1dG9jb21wbGV0ZSwhYXV0b2ZvY3VzLCFjaGVja2VkLCFkZWZhdWx0Q2hlY2tlZCxkZWZhdWx0VmFsdWUsZGlyTmFtZSwhZGlzYWJsZWQsJWZpbGVzLGZvcm1BY3Rpb24sZm9ybUVuY3R5cGUsZm9ybU1ldGhvZCwhZm9ybU5vVmFsaWRhdGUsZm9ybVRhcmdldCwjaGVpZ2h0LCFpbmNyZW1lbnRhbCwhaW5kZXRlcm1pbmF0ZSxtYXgsI21heExlbmd0aCxtaW4sI21pbkxlbmd0aCwhbXVsdGlwbGUsbmFtZSxwYXR0ZXJuLHBsYWNlaG9sZGVyLCFyZWFkT25seSwhcmVxdWlyZWQsc2VsZWN0aW9uRGlyZWN0aW9uLCNzZWxlY3Rpb25FbmQsI3NlbGVjdGlvblN0YXJ0LCNzaXplLHNyYyxzdGVwLHR5cGUsdXNlTWFwLHZhbHVlLCV2YWx1ZUFzRGF0ZSwjdmFsdWVBc051bWJlciwjd2lkdGgnLFxuICAgICAgJ2tleWdlbnwhYXV0b2ZvY3VzLGNoYWxsZW5nZSwhZGlzYWJsZWQsa2V5dHlwZSxuYW1lJyxcbiAgICAgICdsaXx0eXBlLCN2YWx1ZScsXG4gICAgICAnbGFiZWx8aHRtbEZvcicsXG4gICAgICAnbGVnZW5kfGFsaWduJyxcbiAgICAgICdsaW5rfGFzLGNoYXJzZXQsJWNyb3NzT3JpZ2luLCFkaXNhYmxlZCxocmVmLGhyZWZsYW5nLGludGVncml0eSxtZWRpYSxyZWwsJXJlbExpc3QscmV2LCVzaXplcyx0YXJnZXQsdHlwZScsXG4gICAgICAnbWFwfG5hbWUnLFxuICAgICAgJ21hcnF1ZWV8YmVoYXZpb3IsYmdDb2xvcixkaXJlY3Rpb24saGVpZ2h0LCNoc3BhY2UsI2xvb3AsI3Njcm9sbEFtb3VudCwjc2Nyb2xsRGVsYXksIXRydWVTcGVlZCwjdnNwYWNlLHdpZHRoJyxcbiAgICAgICdtZW51fCFjb21wYWN0JyxcbiAgICAgICdtZXRhfGNvbnRlbnQsaHR0cEVxdWl2LG5hbWUsc2NoZW1lJyxcbiAgICAgICdtZXRlcnwjaGlnaCwjbG93LCNtYXgsI21pbiwjb3B0aW11bSwjdmFsdWUnLFxuICAgICAgJ2lucyxkZWx8Y2l0ZSxkYXRlVGltZScsXG4gICAgICAnb2x8IWNvbXBhY3QsIXJldmVyc2VkLCNzdGFydCx0eXBlJyxcbiAgICAgICdvYmplY3R8YWxpZ24sYXJjaGl2ZSxib3JkZXIsY29kZSxjb2RlQmFzZSxjb2RlVHlwZSxkYXRhLCFkZWNsYXJlLGhlaWdodCwjaHNwYWNlLG5hbWUsc3RhbmRieSx0eXBlLHVzZU1hcCwjdnNwYWNlLHdpZHRoJyxcbiAgICAgICdvcHRncm91cHwhZGlzYWJsZWQsbGFiZWwnLFxuICAgICAgJ29wdGlvbnwhZGVmYXVsdFNlbGVjdGVkLCFkaXNhYmxlZCxsYWJlbCwhc2VsZWN0ZWQsdGV4dCx2YWx1ZScsXG4gICAgICAnb3V0cHV0fGRlZmF1bHRWYWx1ZSwlaHRtbEZvcixuYW1lLHZhbHVlJyxcbiAgICAgICdwfGFsaWduJyxcbiAgICAgICdwYXJhbXxuYW1lLHR5cGUsdmFsdWUsdmFsdWVUeXBlJyxcbiAgICAgICdwaWN0dXJlfCcsXG4gICAgICAncHJlfCN3aWR0aCcsXG4gICAgICAncHJvZ3Jlc3N8I21heCwjdmFsdWUnLFxuICAgICAgJ3EsYmxvY2txdW90ZSxjaXRlfCcsXG4gICAgICAnc2NyaXB0fCFhc3luYyxjaGFyc2V0LCVjcm9zc09yaWdpbiwhZGVmZXIsZXZlbnQsaHRtbEZvcixpbnRlZ3JpdHksc3JjLHRleHQsdHlwZScsXG4gICAgICAnc2VsZWN0fCFhdXRvZm9jdXMsIWRpc2FibGVkLCNsZW5ndGgsIW11bHRpcGxlLG5hbWUsIXJlcXVpcmVkLCNzZWxlY3RlZEluZGV4LCNzaXplLHZhbHVlJyxcbiAgICAgICdzaGFkb3d8JyxcbiAgICAgICdzb3VyY2V8bWVkaWEsc2l6ZXMsc3JjLHNyY3NldCx0eXBlJyxcbiAgICAgICdzcGFufCcsXG4gICAgICAnc3R5bGV8IWRpc2FibGVkLG1lZGlhLHR5cGUnLFxuICAgICAgJ2NhcHRpb258YWxpZ24nLFxuICAgICAgJ3RoLHRkfGFiYnIsYWxpZ24sYXhpcyxiZ0NvbG9yLGNoLGNoT2ZmLCNjb2xTcGFuLGhlYWRlcnMsaGVpZ2h0LCFub1dyYXAsI3Jvd1NwYW4sc2NvcGUsdkFsaWduLHdpZHRoJyxcbiAgICAgICdjb2wsY29sZ3JvdXB8YWxpZ24sY2gsY2hPZmYsI3NwYW4sdkFsaWduLHdpZHRoJyxcbiAgICAgICd0YWJsZXxhbGlnbixiZ0NvbG9yLGJvcmRlciwlY2FwdGlvbixjZWxsUGFkZGluZyxjZWxsU3BhY2luZyxmcmFtZSxydWxlcyxzdW1tYXJ5LCV0Rm9vdCwldEhlYWQsd2lkdGgnLFxuICAgICAgJ3RyfGFsaWduLGJnQ29sb3IsY2gsY2hPZmYsdkFsaWduJyxcbiAgICAgICd0Zm9vdCx0aGVhZCx0Ym9keXxhbGlnbixjaCxjaE9mZix2QWxpZ24nLFxuICAgICAgJ3RlbXBsYXRlfCcsXG4gICAgICAndGV4dGFyZWF8YXV0b2NhcGl0YWxpemUsIWF1dG9mb2N1cywjY29scyxkZWZhdWx0VmFsdWUsZGlyTmFtZSwhZGlzYWJsZWQsI21heExlbmd0aCwjbWluTGVuZ3RoLG5hbWUscGxhY2Vob2xkZXIsIXJlYWRPbmx5LCFyZXF1aXJlZCwjcm93cyxzZWxlY3Rpb25EaXJlY3Rpb24sI3NlbGVjdGlvbkVuZCwjc2VsZWN0aW9uU3RhcnQsdmFsdWUsd3JhcCcsXG4gICAgICAndGl0bGV8dGV4dCcsXG4gICAgICAndHJhY2t8IWRlZmF1bHQsa2luZCxsYWJlbCxzcmMsc3JjbGFuZycsXG4gICAgICAndWx8IWNvbXBhY3QsdHlwZScsXG4gICAgICAndW5rbm93bnwnLFxuICAgICAgJ3ZpZGVvXm1lZGlhfCNoZWlnaHQscG9zdGVyLCN3aWR0aCcsXG4gICAgICAnQHN2ZzphXkBzdmc6Z3JhcGhpY3N8JyxcbiAgICAgICdAc3ZnOmFuaW1hdGVeQHN2ZzphbmltYXRpb258JyxcbiAgICAgICdAc3ZnOmFuaW1hdGVNb3Rpb25eQHN2ZzphbmltYXRpb258JyxcbiAgICAgICdAc3ZnOmFuaW1hdGVUcmFuc2Zvcm1eQHN2ZzphbmltYXRpb258JyxcbiAgICAgICdAc3ZnOmNpcmNsZV5Ac3ZnOmdlb21ldHJ5fCcsXG4gICAgICAnQHN2ZzpjbGlwUGF0aF5Ac3ZnOmdyYXBoaWNzfCcsXG4gICAgICAnQHN2ZzpjdXJzb3JeQHN2Zzp8JyxcbiAgICAgICdAc3ZnOmRlZnNeQHN2ZzpncmFwaGljc3wnLFxuICAgICAgJ0Bzdmc6ZGVzY15Ac3ZnOnwnLFxuICAgICAgJ0Bzdmc6ZGlzY2FyZF5Ac3ZnOnwnLFxuICAgICAgJ0Bzdmc6ZWxsaXBzZV5Ac3ZnOmdlb21ldHJ5fCcsXG4gICAgICAnQHN2ZzpmZUJsZW5kXkBzdmc6fCcsXG4gICAgICAnQHN2ZzpmZUNvbG9yTWF0cml4XkBzdmc6fCcsXG4gICAgICAnQHN2ZzpmZUNvbXBvbmVudFRyYW5zZmVyXkBzdmc6fCcsXG4gICAgICAnQHN2ZzpmZUNvbXBvc2l0ZV5Ac3ZnOnwnLFxuICAgICAgJ0Bzdmc6ZmVDb252b2x2ZU1hdHJpeF5Ac3ZnOnwnLFxuICAgICAgJ0Bzdmc6ZmVEaWZmdXNlTGlnaHRpbmdeQHN2Zzp8JyxcbiAgICAgICdAc3ZnOmZlRGlzcGxhY2VtZW50TWFwXkBzdmc6fCcsXG4gICAgICAnQHN2ZzpmZURpc3RhbnRMaWdodF5Ac3ZnOnwnLFxuICAgICAgJ0Bzdmc6ZmVEcm9wU2hhZG93XkBzdmc6fCcsXG4gICAgICAnQHN2ZzpmZUZsb29kXkBzdmc6fCcsXG4gICAgICAnQHN2ZzpmZUZ1bmNBXkBzdmc6Y29tcG9uZW50VHJhbnNmZXJGdW5jdGlvbnwnLFxuICAgICAgJ0Bzdmc6ZmVGdW5jQl5Ac3ZnOmNvbXBvbmVudFRyYW5zZmVyRnVuY3Rpb258JyxcbiAgICAgICdAc3ZnOmZlRnVuY0deQHN2Zzpjb21wb25lbnRUcmFuc2ZlckZ1bmN0aW9ufCcsXG4gICAgICAnQHN2ZzpmZUZ1bmNSXkBzdmc6Y29tcG9uZW50VHJhbnNmZXJGdW5jdGlvbnwnLFxuICAgICAgJ0Bzdmc6ZmVHYXVzc2lhbkJsdXJeQHN2Zzp8JyxcbiAgICAgICdAc3ZnOmZlSW1hZ2VeQHN2Zzp8JyxcbiAgICAgICdAc3ZnOmZlTWVyZ2VeQHN2Zzp8JyxcbiAgICAgICdAc3ZnOmZlTWVyZ2VOb2RlXkBzdmc6fCcsXG4gICAgICAnQHN2ZzpmZU1vcnBob2xvZ3leQHN2Zzp8JyxcbiAgICAgICdAc3ZnOmZlT2Zmc2V0XkBzdmc6fCcsXG4gICAgICAnQHN2ZzpmZVBvaW50TGlnaHReQHN2Zzp8JyxcbiAgICAgICdAc3ZnOmZlU3BlY3VsYXJMaWdodGluZ15Ac3ZnOnwnLFxuICAgICAgJ0Bzdmc6ZmVTcG90TGlnaHReQHN2Zzp8JyxcbiAgICAgICdAc3ZnOmZlVGlsZV5Ac3ZnOnwnLFxuICAgICAgJ0Bzdmc6ZmVUdXJidWxlbmNlXkBzdmc6fCcsXG4gICAgICAnQHN2ZzpmaWx0ZXJeQHN2Zzp8JyxcbiAgICAgICdAc3ZnOmZvcmVpZ25PYmplY3ReQHN2ZzpncmFwaGljc3wnLFxuICAgICAgJ0Bzdmc6Z15Ac3ZnOmdyYXBoaWNzfCcsXG4gICAgICAnQHN2ZzppbWFnZV5Ac3ZnOmdyYXBoaWNzfCcsXG4gICAgICAnQHN2ZzpsaW5lXkBzdmc6Z2VvbWV0cnl8JyxcbiAgICAgICdAc3ZnOmxpbmVhckdyYWRpZW50XkBzdmc6Z3JhZGllbnR8JyxcbiAgICAgICdAc3ZnOm1wYXRoXkBzdmc6fCcsXG4gICAgICAnQHN2ZzptYXJrZXJeQHN2Zzp8JyxcbiAgICAgICdAc3ZnOm1hc2teQHN2Zzp8JyxcbiAgICAgICdAc3ZnOm1ldGFkYXRhXkBzdmc6fCcsXG4gICAgICAnQHN2ZzpwYXRoXkBzdmc6Z2VvbWV0cnl8JyxcbiAgICAgICdAc3ZnOnBhdHRlcm5eQHN2Zzp8JyxcbiAgICAgICdAc3ZnOnBvbHlnb25eQHN2ZzpnZW9tZXRyeXwnLFxuICAgICAgJ0Bzdmc6cG9seWxpbmVeQHN2ZzpnZW9tZXRyeXwnLFxuICAgICAgJ0Bzdmc6cmFkaWFsR3JhZGllbnReQHN2ZzpncmFkaWVudHwnLFxuICAgICAgJ0Bzdmc6cmVjdF5Ac3ZnOmdlb21ldHJ5fCcsXG4gICAgICAnQHN2ZzpzdmdeQHN2ZzpncmFwaGljc3wjY3VycmVudFNjYWxlLCN6b29tQW5kUGFuJyxcbiAgICAgICdAc3ZnOnNjcmlwdF5Ac3ZnOnx0eXBlJyxcbiAgICAgICdAc3ZnOnNldF5Ac3ZnOmFuaW1hdGlvbnwnLFxuICAgICAgJ0Bzdmc6c3RvcF5Ac3ZnOnwnLFxuICAgICAgJ0Bzdmc6c3R5bGVeQHN2Zzp8IWRpc2FibGVkLG1lZGlhLHRpdGxlLHR5cGUnLFxuICAgICAgJ0Bzdmc6c3dpdGNoXkBzdmc6Z3JhcGhpY3N8JyxcbiAgICAgICdAc3ZnOnN5bWJvbF5Ac3ZnOnwnLFxuICAgICAgJ0Bzdmc6dHNwYW5eQHN2Zzp0ZXh0UG9zaXRpb25pbmd8JyxcbiAgICAgICdAc3ZnOnRleHReQHN2Zzp0ZXh0UG9zaXRpb25pbmd8JyxcbiAgICAgICdAc3ZnOnRleHRQYXRoXkBzdmc6dGV4dENvbnRlbnR8JyxcbiAgICAgICdAc3ZnOnRpdGxlXkBzdmc6fCcsXG4gICAgICAnQHN2Zzp1c2VeQHN2ZzpncmFwaGljc3wnLFxuICAgICAgJ0Bzdmc6dmlld15Ac3ZnOnwjem9vbUFuZFBhbidcbiAgICBdKTtcblxudmFyIGF0dHJUb1Byb3BNYXA6IHtbbmFtZTogc3RyaW5nXTogc3RyaW5nfSA9IDxhbnk+e1xuICAnY2xhc3MnOiAnY2xhc3NOYW1lJyxcbiAgJ2lubmVySHRtbCc6ICdpbm5lckhUTUwnLFxuICAncmVhZG9ubHknOiAncmVhZE9ubHknLFxuICAndGFiaW5kZXgnOiAndGFiSW5kZXgnXG59O1xuXG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBEb21FbGVtZW50U2NoZW1hUmVnaXN0cnkgaW1wbGVtZW50cyBFbGVtZW50U2NoZW1hUmVnaXN0cnkge1xuICBzY2hlbWEgPSA8e1tlbGVtZW50OiBzdHJpbmddOiB7W3Byb3BlcnR5OiBzdHJpbmddOiBzdHJpbmd9fT57fTtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBTQ0hFTUEuZm9yRWFjaChlbmNvZGVkVHlwZSA9PiB7XG4gICAgICB2YXIgcGFydHMgPSBlbmNvZGVkVHlwZS5zcGxpdCgnfCcpO1xuICAgICAgdmFyIHByb3BlcnRpZXMgPSBwYXJ0c1sxXS5zcGxpdCgnLCcpO1xuICAgICAgdmFyIHR5cGVQYXJ0cyA9IChwYXJ0c1swXSArICdeJykuc3BsaXQoJ14nKTtcbiAgICAgIHZhciB0eXBlTmFtZSA9IHR5cGVQYXJ0c1swXTtcbiAgICAgIHZhciB0eXBlID0gPHtbcHJvcGVydHk6IHN0cmluZ106IHN0cmluZ30+e307XG4gICAgICB0eXBlTmFtZS5zcGxpdCgnLCcpLmZvckVhY2godGFnID0+IHRoaXMuc2NoZW1hW3RhZ10gPSB0eXBlKTtcbiAgICAgIHZhciBzdXBlclR5cGUgPSB0aGlzLnNjaGVtYVt0eXBlUGFydHNbMV1dO1xuICAgICAgaWYgKGlzUHJlc2VudChzdXBlclR5cGUpKSB7XG4gICAgICAgIFN0cmluZ01hcFdyYXBwZXIuZm9yRWFjaChzdXBlclR5cGUsICh2LCBrKSA9PiB0eXBlW2tdID0gdik7XG4gICAgICB9XG4gICAgICBwcm9wZXJ0aWVzLmZvckVhY2goKHByb3BlcnR5OiBzdHJpbmcpID0+IHtcbiAgICAgICAgaWYgKHByb3BlcnR5ID09ICcnKSB7XG4gICAgICAgIH0gZWxzZSBpZiAocHJvcGVydHkuc3RhcnRzV2l0aCgnKicpKSB7XG4gICAgICAgICAgLy8gV2UgZG9uJ3QgeWV0IHN1cHBvcnQgZXZlbnRzLlxuICAgICAgICAgIC8vIHR5cGVbcHJvcGVydHkuc3Vic3RyaW5nKDEpXSA9IEVWRU5UO1xuICAgICAgICB9IGVsc2UgaWYgKHByb3BlcnR5LnN0YXJ0c1dpdGgoJyEnKSkge1xuICAgICAgICAgIHR5cGVbcHJvcGVydHkuc3Vic3RyaW5nKDEpXSA9IEJPT0xFQU47XG4gICAgICAgIH0gZWxzZSBpZiAocHJvcGVydHkuc3RhcnRzV2l0aCgnIycpKSB7XG4gICAgICAgICAgdHlwZVtwcm9wZXJ0eS5zdWJzdHJpbmcoMSldID0gTlVNQkVSO1xuICAgICAgICB9IGVsc2UgaWYgKHByb3BlcnR5LnN0YXJ0c1dpdGgoJyUnKSkge1xuICAgICAgICAgIHR5cGVbcHJvcGVydHkuc3Vic3RyaW5nKDEpXSA9IE9CSkVDVDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0eXBlW3Byb3BlcnR5XSA9IFNUUklORztcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICBoYXNQcm9wZXJ0eSh0YWdOYW1lOiBzdHJpbmcsIHByb3BOYW1lOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICBpZiAodGFnTmFtZS5pbmRleE9mKCctJykgIT09IC0xKSB7XG4gICAgICAvLyBjYW4ndCB0ZWxsIG5vdyBhcyB3ZSBkb24ndCBrbm93IHdoaWNoIHByb3BlcnRpZXMgYSBjdXN0b20gZWxlbWVudCB3aWxsIGdldFxuICAgICAgLy8gb25jZSBpdCBpcyBpbnN0YW50aWF0ZWRcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgZWxlbWVudFByb3BlcnRpZXMgPSB0aGlzLnNjaGVtYVt0YWdOYW1lLnRvTG93ZXJDYXNlKCldO1xuICAgICAgaWYgKCFpc1ByZXNlbnQoZWxlbWVudFByb3BlcnRpZXMpKSB7XG4gICAgICAgIGVsZW1lbnRQcm9wZXJ0aWVzID0gdGhpcy5zY2hlbWFbJ3Vua25vd24nXTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBpc1ByZXNlbnQoZWxlbWVudFByb3BlcnRpZXNbcHJvcE5hbWVdKTtcbiAgICB9XG4gIH1cblxuICBnZXRNYXBwZWRQcm9wTmFtZShwcm9wTmFtZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgICB2YXIgbWFwcGVkUHJvcE5hbWUgPSBTdHJpbmdNYXBXcmFwcGVyLmdldChhdHRyVG9Qcm9wTWFwLCBwcm9wTmFtZSk7XG4gICAgcmV0dXJuIGlzUHJlc2VudChtYXBwZWRQcm9wTmFtZSkgPyBtYXBwZWRQcm9wTmFtZSA6IHByb3BOYW1lO1xuICB9XG59XG4iXX0=