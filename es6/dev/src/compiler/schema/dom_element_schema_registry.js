var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable } from 'angular2/src/core/di';
import { isPresent, CONST_EXPR } from 'angular2/src/facade/lang';
import { StringMapWrapper } from 'angular2/src/facade/collection';
const EVENT = 'event';
const BOOLEAN = 'boolean';
const NUMBER = 'number';
const STRING = 'string';
const OBJECT = 'object';
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
const SCHEMA = CONST_EXPR([
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
export let DomElementSchemaRegistry = class DomElementSchemaRegistry {
    constructor() {
        this.schema = {};
        SCHEMA.forEach(encodedType => {
            var parts = encodedType.split('|');
            var properties = parts[1].split(',');
            var typeParts = (parts[0] + '^').split('^');
            var typeName = typeParts[0];
            var type = {};
            typeName.split(',').forEach(tag => this.schema[tag] = type);
            var superType = this.schema[typeParts[1]];
            if (isPresent(superType)) {
                StringMapWrapper.forEach(superType, (v, k) => type[k] = v);
            }
            properties.forEach((property) => {
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
    hasProperty(tagName, propName) {
        if (tagName.indexOf('-') !== -1) {
            // can't tell now as we don't know which properties a custom element will get
            // once it is instantiated
            return true;
        }
        else {
            var elementProperties = this.schema[tagName.toLowerCase()];
            if (!isPresent(elementProperties)) {
                elementProperties = this.schema['unknown'];
            }
            return isPresent(elementProperties[propName]);
        }
    }
    getMappedPropName(propName) {
        var mappedPropName = StringMapWrapper.get(attrToPropMap, propName);
        return isPresent(mappedPropName) ? mappedPropName : propName;
    }
};
DomElementSchemaRegistry = __decorate([
    Injectable(), 
    __metadata('design:paramtypes', [])
], DomElementSchemaRegistry);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZG9tX2VsZW1lbnRfc2NoZW1hX3JlZ2lzdHJ5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZGlmZmluZ19wbHVnaW5fd3JhcHBlci1vdXRwdXRfcGF0aC1zbTQ2bEU0dC50bXAvYW5ndWxhcjIvc3JjL2NvbXBpbGVyL3NjaGVtYS9kb21fZWxlbWVudF9zY2hlbWFfcmVnaXN0cnkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O09BQU8sRUFBQyxVQUFVLEVBQUMsTUFBTSxzQkFBc0I7T0FDeEMsRUFBQyxTQUFTLEVBQUUsVUFBVSxFQUFDLE1BQU0sMEJBQTBCO09BQ3ZELEVBQUMsZ0JBQWdCLEVBQUMsTUFBTSxnQ0FBZ0M7QUFHL0QsTUFBTSxLQUFLLEdBQUcsT0FBTyxDQUFDO0FBQ3RCLE1BQU0sT0FBTyxHQUFHLFNBQVMsQ0FBQztBQUMxQixNQUFNLE1BQU0sR0FBRyxRQUFRLENBQUM7QUFDeEIsTUFBTSxNQUFNLEdBQUcsUUFBUSxDQUFDO0FBQ3hCLE1BQU0sTUFBTSxHQUFHLFFBQVEsQ0FBQztBQUV4Qjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBdUNHO0FBQ0gsTUFBTSxNQUFNLEdBQ1IsVUFBVSxDQUFDO0lBQ1QsdU1BQXVNO0lBQ3ZNLHcrQkFBdytCO0lBQ3grQix5S0FBeUs7SUFDeksscW1CQUFxbUI7SUFDcm1CLHNCQUFzQjtJQUN0QiwwQ0FBMEM7SUFDMUMsc0JBQXNCO0lBQ3RCLHVDQUF1QztJQUN2QyxzQkFBc0I7SUFDdEIsaUNBQWlDO0lBQ2pDLHdDQUF3QztJQUN4QyxxSkFBcUo7SUFDckosbUhBQW1IO0lBQ25ILGNBQWM7SUFDZCxVQUFVO0lBQ1Ysa0JBQWtCO0lBQ2xCLGtQQUFrUDtJQUNsUCwwR0FBMEc7SUFDMUcsdUJBQXVCO0lBQ3ZCLGdCQUFnQjtJQUNoQixhQUFhO0lBQ2IsV0FBVztJQUNYLGVBQWU7SUFDZiwwQkFBMEI7SUFDMUIsY0FBYztJQUNkLFdBQVc7SUFDWCx3Q0FB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LENBQUMsUUFBZ0I7UUFDaEMsSUFBSSxjQUFjLEdBQUcsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLGFBQWEsRUFBRSxRQUFRLENBQUMsQ0FBQztRQUNuRSxNQUFNLENBQUMsU0FBUyxDQUFDLGNBQWMsQ0FBQyxHQUFHLGNBQWMsR0FBRyxRQUFRLENBQUM7SUFDL0QsQ0FBQztBQUNILENBQUM7QUFwREQ7SUFBQyxVQUFVLEVBQUU7OzRCQUFBO0FBb0RaIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtJbmplY3RhYmxlfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9kaSc7XG5pbXBvcnQge2lzUHJlc2VudCwgQ09OU1RfRVhQUn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcbmltcG9ydCB7U3RyaW5nTWFwV3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9jb2xsZWN0aW9uJztcbmltcG9ydCB7RWxlbWVudFNjaGVtYVJlZ2lzdHJ5fSBmcm9tICcuL2VsZW1lbnRfc2NoZW1hX3JlZ2lzdHJ5JztcblxuY29uc3QgRVZFTlQgPSAnZXZlbnQnO1xuY29uc3QgQk9PTEVBTiA9ICdib29sZWFuJztcbmNvbnN0IE5VTUJFUiA9ICdudW1iZXInO1xuY29uc3QgU1RSSU5HID0gJ3N0cmluZyc7XG5jb25zdCBPQkpFQ1QgPSAnb2JqZWN0JztcblxuLyoqXG4gKiBUaGlzIGFycmF5IHJlcHJlc2VudHMgdGhlIERPTSBzY2hlbWEuIEl0IGVuY29kZXMgaW5oZXJpdGFuY2UsIHByb3BlcnRpZXMsIGFuZCBldmVudHMuXG4gKlxuICogIyMgT3ZlcnZpZXdcbiAqXG4gKiBFYWNoIGxpbmUgcmVwcmVzZW50cyBvbmUga2luZCBvZiBlbGVtZW50LiBUaGUgYGVsZW1lbnRfaW5oZXJpdGFuY2VgIGFuZCBwcm9wZXJ0aWVzIGFyZSBqb2luZWRcbiAqIHVzaW5nIGBlbGVtZW50X2luaGVyaXRhbmNlfHByZXBlcnRpZXNgIHN5bnRheC5cbiAqXG4gKiAjIyBFbGVtZW50IEluaGVyaXRhbmNlXG4gKlxuICogVGhlIGBlbGVtZW50X2luaGVyaXRhbmNlYCBjYW4gYmUgZnVydGhlciBzdWJkaXZpZGVkIGFzIGBlbGVtZW50MSxlbGVtZW50MiwuLi5ecGFyZW50RWxlbWVudGAuXG4gKiBIZXJlIHRoZSBpbmRpdmlkdWFsIGVsZW1lbnRzIGFyZSBzZXBhcmF0ZWQgYnkgYCxgIChjb21tYXMpLiBFdmVyeSBlbGVtZW50IGluIHRoZSBsaXN0XG4gKiBoYXMgaWRlbnRpY2FsIHByb3BlcnRpZXMuXG4gKlxuICogQW4gYGVsZW1lbnRgIG1heSBpbmhlcml0IGFkZGl0aW9uYWwgcHJvcGVydGllcyBmcm9tIGBwYXJlbnRFbGVtZW50YCBJZiBubyBgXnBhcmVudEVsZW1lbnRgIGlzXG4gKiBzcGVjaWZpZWQgdGhlbiBgXCJcImAgKGJsYW5rKSBlbGVtZW50IGlzIGFzc3VtZWQuXG4gKlxuICogTk9URTogVGhlIGJsYW5rIGVsZW1lbnQgaW5oZXJpdHMgZnJvbSByb290IGAqYCBlbGVtZW50LCB0aGUgc3VwZXIgZWxlbWVudCBvZiBhbGwgZWxlbWVudHMuXG4gKlxuICogTk9URSBhbiBlbGVtZW50IHByZWZpeCBzdWNoIGFzIGBAc3ZnOmAgaGFzIG5vIHNwZWNpYWwgbWVhbmluZyB0byB0aGUgc2NoZW1hLlxuICpcbiAqICMjIFByb3BlcnRpZXNcbiAqXG4gKiBFYWNoIGVsZW1lbnQgaGFzIGEgc2V0IG9mIHByb3BlcnRpZXMgc2VwYXJhdGVkIGJ5IGAsYCAoY29tbWFzKS4gRWFjaCBwcm9wZXJ0eSBjYW4gYmUgcHJlZml4ZWRcbiAqIGJ5IGEgc3BlY2lhbCBjaGFyYWN0ZXIgZGVzaWduYXRpbmcgaXRzIHR5cGU6XG4gKlxuICogLSAobm8gcHJlZml4KTogcHJvcGVydHkgaXMgYSBzdHJpbmcuXG4gKiAtIGAqYDogcHJvcGVydHkgcmVwcmVzZW50cyBhbiBldmVudC5cbiAqIC0gYCFgOiBwcm9wZXJ0eSBpcyBhIGJvb2xlYW4uXG4gKiAtIGAjYDogcHJvcGVydHkgaXMgYSBudW1iZXIuXG4gKiAtIGAlYDogcHJvcGVydHkgaXMgYW4gb2JqZWN0LlxuICpcbiAqICMjIFF1ZXJ5XG4gKlxuICogVGhlIGNsYXNzIGNyZWF0ZXMgYW4gaW50ZXJuYWwgc3F1YXMgcmVwcmVzZW50YWlubyB3aGljaCBhbGxvd3MgdG8gZWFzaWx5IGFuc3dlciB0aGUgcXVlcnkgb2ZcbiAqIGlmIGEgZ2l2ZW4gcHJvcGVydHkgZXhpc3Qgb24gYSBnaXZlbiBlbGVtZW50LlxuICpcbiAqIE5PVEU6IFdlIGRvbid0IHlldCBzdXBwb3J0IHF1ZXJ5aW5nIGZvciB0eXBlcyBvciBldmVudHMuXG4gKiBOT1RFOiBUaGlzIHNjaGVtYSBpcyBhdXRvIGV4dHJhY3RlZCBmcm9tIGBzY2hlbWFfZXh0cmFjdG9yLnRzYCBsb2NhdGVkIGluIHRoZSB0ZXN0IGZvbGRlci5cbiAqL1xuY29uc3QgU0NIRU1BOiBzdHJpbmdbXSA9XG4gICAgQ09OU1RfRVhQUihbXG4gICAgICAnKnwlY2xhc3NMaXN0LGNsYXNzTmFtZSxpZCxpbm5lckhUTUwsKmJlZm9yZWNvcHksKmJlZm9yZWN1dCwqYmVmb3JlcGFzdGUsKmNvcHksKmN1dCwqcGFzdGUsKnNlYXJjaCwqc2VsZWN0c3RhcnQsKndlYmtpdGZ1bGxzY3JlZW5jaGFuZ2UsKndlYmtpdGZ1bGxzY3JlZW5lcnJvciwqd2hlZWwsb3V0ZXJIVE1MLCNzY3JvbGxMZWZ0LCNzY3JvbGxUb3AnLFxuICAgICAgJ14qfGFjY2Vzc0tleSxjb250ZW50RWRpdGFibGUsZGlyLCFkcmFnZ2FibGUsIWhpZGRlbixpbm5lclRleHQsbGFuZywqYWJvcnQsKmF1dG9jb21wbGV0ZSwqYXV0b2NvbXBsZXRlZXJyb3IsKmJlZm9yZWNvcHksKmJlZm9yZWN1dCwqYmVmb3JlcGFzdGUsKmJsdXIsKmNhbmNlbCwqY2FucGxheSwqY2FucGxheXRocm91Z2gsKmNoYW5nZSwqY2xpY2ssKmNsb3NlLCpjb250ZXh0bWVudSwqY29weSwqY3VlY2hhbmdlLCpjdXQsKmRibGNsaWNrLCpkcmFnLCpkcmFnZW5kLCpkcmFnZW50ZXIsKmRyYWdsZWF2ZSwqZHJhZ292ZXIsKmRyYWdzdGFydCwqZHJvcCwqZHVyYXRpb25jaGFuZ2UsKmVtcHRpZWQsKmVuZGVkLCplcnJvciwqZm9jdXMsKmlucHV0LCppbnZhbGlkLCprZXlkb3duLCprZXlwcmVzcywqa2V5dXAsKmxvYWQsKmxvYWRlZGRhdGEsKmxvYWRlZG1ldGFkYXRhLCpsb2Fkc3RhcnQsKm1lc3NhZ2UsKm1vdXNlZG93biwqbW91c2VlbnRlciwqbW91c2VsZWF2ZSwqbW91c2Vtb3ZlLCptb3VzZW91dCwqbW91c2VvdmVyLCptb3VzZXVwLCptb3VzZXdoZWVsLCptb3pmdWxsc2NyZWVuY2hhbmdlLCptb3pmdWxsc2NyZWVuZXJyb3IsKm1venBvaW50ZXJsb2NrY2hhbmdlLCptb3pwb2ludGVybG9ja2Vycm9yLCpwYXN0ZSwqcGF1c2UsKnBsYXksKnBsYXlpbmcsKnByb2dyZXNzLCpyYXRlY2hhbmdlLCpyZXNldCwqcmVzaXplLCpzY3JvbGwsKnNlYXJjaCwqc2Vla2VkLCpzZWVraW5nLCpzZWxlY3QsKnNlbGVjdHN0YXJ0LCpzaG93LCpzdGFsbGVkLCpzdWJtaXQsKnN1c3BlbmQsKnRpbWV1cGRhdGUsKnRvZ2dsZSwqdm9sdW1lY2hhbmdlLCp3YWl0aW5nLCp3ZWJnbGNvbnRleHRjcmVhdGlvbmVycm9yLCp3ZWJnbGNvbnRleHRsb3N0LCp3ZWJnbGNvbnRleHRyZXN0b3JlZCwqd2Via2l0ZnVsbHNjcmVlbmNoYW5nZSwqd2Via2l0ZnVsbHNjcmVlbmVycm9yLCp3aGVlbCxvdXRlclRleHQsIXNwZWxsY2hlY2ssJXN0eWxlLCN0YWJJbmRleCx0aXRsZSwhdHJhbnNsYXRlJyxcbiAgICAgICdtZWRpYXwhYXV0b3BsYXksIWNvbnRyb2xzLCVjcm9zc09yaWdpbiwjY3VycmVudFRpbWUsIWRlZmF1bHRNdXRlZCwjZGVmYXVsdFBsYXliYWNrUmF0ZSwhZGlzYWJsZVJlbW90ZVBsYXliYWNrLCFsb29wLCFtdXRlZCwqZW5jcnlwdGVkLCNwbGF5YmFja1JhdGUscHJlbG9hZCxzcmMsI3ZvbHVtZScsXG4gICAgICAnQHN2ZzpeKnwqYWJvcnQsKmF1dG9jb21wbGV0ZSwqYXV0b2NvbXBsZXRlZXJyb3IsKmJsdXIsKmNhbmNlbCwqY2FucGxheSwqY2FucGxheXRocm91Z2gsKmNoYW5nZSwqY2xpY2ssKmNsb3NlLCpjb250ZXh0bWVudSwqY3VlY2hhbmdlLCpkYmxjbGljaywqZHJhZywqZHJhZ2VuZCwqZHJhZ2VudGVyLCpkcmFnbGVhdmUsKmRyYWdvdmVyLCpkcmFnc3RhcnQsKmRyb3AsKmR1cmF0aW9uY2hhbmdlLCplbXB0aWVkLCplbmRlZCwqZXJyb3IsKmZvY3VzLCppbnB1dCwqaW52YWxpZCwqa2V5ZG93biwqa2V5cHJlc3MsKmtleXVwLCpsb2FkLCpsb2FkZWRkYXRhLCpsb2FkZWRtZXRhZGF0YSwqbG9hZHN0YXJ0LCptb3VzZWRvd24sKm1vdXNlZW50ZXIsKm1vdXNlbGVhdmUsKm1vdXNlbW92ZSwqbW91c2VvdXQsKm1vdXNlb3ZlciwqbW91c2V1cCwqbW91c2V3aGVlbCwqcGF1c2UsKnBsYXksKnBsYXlpbmcsKnByb2dyZXNzLCpyYXRlY2hhbmdlLCpyZXNldCwqcmVzaXplLCpzY3JvbGwsKnNlZWtlZCwqc2Vla2luZywqc2VsZWN0LCpzaG93LCpzdGFsbGVkLCpzdWJtaXQsKnN1c3BlbmQsKnRpbWV1cGRhdGUsKnRvZ2dsZSwqdm9sdW1lY2hhbmdlLCp3YWl0aW5nLCVzdHlsZSwjdGFiSW5kZXgnLFxuICAgICAgJ0Bzdmc6Z3JhcGhpY3NeQHN2Zzp8JyxcbiAgICAgICdAc3ZnOmFuaW1hdGlvbl5Ac3ZnOnwqYmVnaW4sKmVuZCwqcmVwZWF0JyxcbiAgICAgICdAc3ZnOmdlb21ldHJ5XkBzdmc6fCcsXG4gICAgICAnQHN2Zzpjb21wb25lbnRUcmFuc2ZlckZ1bmN0aW9uXkBzdmc6fCcsXG4gICAgICAnQHN2ZzpncmFkaWVudF5Ac3ZnOnwnLFxuICAgICAgJ0Bzdmc6dGV4dENvbnRlbnReQHN2ZzpncmFwaGljc3wnLFxuICAgICAgJ0Bzdmc6dGV4dFBvc2l0aW9uaW5nXkBzdmc6dGV4dENvbnRlbnR8JyxcbiAgICAgICdhfGNoYXJzZXQsY29vcmRzLGRvd25sb2FkLGhhc2gsaG9zdCxob3N0bmFtZSxocmVmLGhyZWZsYW5nLG5hbWUscGFzc3dvcmQscGF0aG5hbWUscGluZyxwb3J0LHByb3RvY29sLHJlbCxyZXYsc2VhcmNoLHNoYXBlLHRhcmdldCx0ZXh0LHR5cGUsdXNlcm5hbWUnLFxuICAgICAgJ2FyZWF8YWx0LGNvb3JkcyxoYXNoLGhvc3QsaG9zdG5hbWUsaHJlZiwhbm9IcmVmLHBhc3N3b3JkLHBhdGhuYW1lLHBpbmcscG9ydCxwcm90b2NvbCxzZWFyY2gsc2hhcGUsdGFyZ2V0LHVzZXJuYW1lJyxcbiAgICAgICdhdWRpb15tZWRpYXwnLFxuICAgICAgJ2JyfGNsZWFyJyxcbiAgICAgICdiYXNlfGhyZWYsdGFyZ2V0JyxcbiAgICAgICdib2R5fGFMaW5rLGJhY2tncm91bmQsYmdDb2xvcixsaW5rLCpiZWZvcmV1bmxvYWQsKmJsdXIsKmVycm9yLCpmb2N1cywqaGFzaGNoYW5nZSwqbGFuZ3VhZ2VjaGFuZ2UsKmxvYWQsKm1lc3NhZ2UsKm9mZmxpbmUsKm9ubGluZSwqcGFnZWhpZGUsKnBhZ2VzaG93LCpwb3BzdGF0ZSwqcmVqZWN0aW9uaGFuZGxlZCwqcmVzaXplLCpzY3JvbGwsKnN0b3JhZ2UsKnVuaGFuZGxlZHJlamVjdGlvbiwqdW5sb2FkLHRleHQsdkxpbmsnLFxuICAgICAgJ2J1dHRvbnwhYXV0b2ZvY3VzLCFkaXNhYmxlZCxmb3JtQWN0aW9uLGZvcm1FbmN0eXBlLGZvcm1NZXRob2QsIWZvcm1Ob1ZhbGlkYXRlLGZvcm1UYXJnZXQsbmFtZSx0eXBlLHZhbHVlJyxcbiAgICAgICdjYW52YXN8I2hlaWdodCwjd2lkdGgnLFxuICAgICAgJ2NvbnRlbnR8c2VsZWN0JyxcbiAgICAgICdkbHwhY29tcGFjdCcsXG4gICAgICAnZGF0YWxpc3R8JyxcbiAgICAgICdkZXRhaWxzfCFvcGVuJyxcbiAgICAgICdkaWFsb2d8IW9wZW4scmV0dXJuVmFsdWUnLFxuICAgICAgJ2RpcnwhY29tcGFjdCcsXG4gICAgICAnZGl2fGFsaWduJyxcbiAgICAgICdlbWJlZHxhbGlnbixoZWlnaHQsbmFtZSxzcmMsdHlwZSx3aWR0aCcsXG4gICAgICAnZmllbGRzZXR8IWRpc2FibGVkLG5hbWUnLFxuICAgICAgJ2ZvbnR8Y29sb3IsZmFjZSxzaXplJyxcbiAgICAgICdmb3JtfGFjY2VwdENoYXJzZXQsYWN0aW9uLGF1dG9jb21wbGV0ZSxlbmNvZGluZyxlbmN0eXBlLG1ldGhvZCxuYW1lLCFub1ZhbGlkYXRlLHRhcmdldCcsXG4gICAgICAnZnJhbWV8ZnJhbWVCb3JkZXIsbG9uZ0Rlc2MsbWFyZ2luSGVpZ2h0LG1hcmdpbldpZHRoLG5hbWUsIW5vUmVzaXplLHNjcm9sbGluZyxzcmMnLFxuICAgICAgJ2ZyYW1lc2V0fGNvbHMsKmJlZm9yZXVubG9hZCwqYmx1ciwqZXJyb3IsKmZvY3VzLCpoYXNoY2hhbmdlLCpsYW5ndWFnZWNoYW5nZSwqbG9hZCwqbWVzc2FnZSwqb2ZmbGluZSwqb25saW5lLCpwYWdlaGlkZSwqcGFnZXNob3csKnBvcHN0YXRlLCpyZWplY3Rpb25oYW5kbGVkLCpyZXNpemUsKnNjcm9sbCwqc3RvcmFnZSwqdW5oYW5kbGVkcmVqZWN0aW9uLCp1bmxvYWQscm93cycsXG4gICAgICAnaHJ8YWxpZ24sY29sb3IsIW5vU2hhZGUsc2l6ZSx3aWR0aCcsXG4gICAgICAnaGVhZHwnLFxuICAgICAgJ2gxLGgyLGgzLGg0LGg1LGg2fGFsaWduJyxcbiAgICAgICdodG1sfHZlcnNpb24nLFxuICAgICAgJ2lmcmFtZXxhbGlnbiwhYWxsb3dGdWxsc2NyZWVuLGZyYW1lQm9yZGVyLGhlaWdodCxsb25nRGVzYyxtYXJnaW5IZWlnaHQsbWFyZ2luV2lkdGgsbmFtZSwlc2FuZGJveCxzY3JvbGxpbmcsc3JjLHNyY2RvYyx3aWR0aCcsXG4gICAgICAnaW1nfGFsaWduLGFsdCxib3JkZXIsJWNyb3NzT3JpZ2luLCNoZWlnaHQsI2hzcGFjZSwhaXNNYXAsbG9uZ0Rlc2MsbG93c3JjLG5hbWUsc2l6ZXMsc3JjLHNyY3NldCx1c2VNYXAsI3ZzcGFjZSwjd2lkdGgnLFxuICAgICAgJ2lucHV0fGFjY2VwdCxhbGlnbixhbHQsYXV0b2NhcGl0YWxpemUsYXV0b2NvbXBsZXRlLCFhdXRvZm9jdXMsIWNoZWNrZWQsIWRlZmF1bHRDaGVja2VkLGRlZmF1bHRWYWx1ZSxkaXJOYW1lLCFkaXNhYmxlZCwlZmlsZXMsZm9ybUFjdGlvbixmb3JtRW5jdHlwZSxmb3JtTWV0aG9kLCFmb3JtTm9WYWxpZGF0ZSxmb3JtVGFyZ2V0LCNoZWlnaHQsIWluY3JlbWVudGFsLCFpbmRldGVybWluYXRlLG1heCwjbWF4TGVuZ3RoLG1pbiwjbWluTGVuZ3RoLCFtdWx0aXBsZSxuYW1lLHBhdHRlcm4scGxhY2Vob2xkZXIsIXJlYWRPbmx5LCFyZXF1aXJlZCxzZWxlY3Rpb25EaXJlY3Rpb24sI3NlbGVjdGlvbkVuZCwjc2VsZWN0aW9uU3RhcnQsI3NpemUsc3JjLHN0ZXAsdHlwZSx1c2VNYXAsdmFsdWUsJXZhbHVlQXNEYXRlLCN2YWx1ZUFzTnVtYmVyLCN3aWR0aCcsXG4gICAgICAna2V5Z2VufCFhdXRvZm9jdXMsY2hhbGxlbmdlLCFkaXNhYmxlZCxrZXl0eXBlLG5hbWUnLFxuICAgICAgJ2xpfHR5cGUsI3ZhbHVlJyxcbiAgICAgICdsYWJlbHxodG1sRm9yJyxcbiAgICAgICdsZWdlbmR8YWxpZ24nLFxuICAgICAgJ2xpbmt8YXMsY2hhcnNldCwlY3Jvc3NPcmlnaW4sIWRpc2FibGVkLGhyZWYsaHJlZmxhbmcsaW50ZWdyaXR5LG1lZGlhLHJlbCwlcmVsTGlzdCxyZXYsJXNpemVzLHRhcmdldCx0eXBlJyxcbiAgICAgICdtYXB8bmFtZScsXG4gICAgICAnbWFycXVlZXxiZWhhdmlvcixiZ0NvbG9yLGRpcmVjdGlvbixoZWlnaHQsI2hzcGFjZSwjbG9vcCwjc2Nyb2xsQW1vdW50LCNzY3JvbGxEZWxheSwhdHJ1ZVNwZWVkLCN2c3BhY2Usd2lkdGgnLFxuICAgICAgJ21lbnV8IWNvbXBhY3QnLFxuICAgICAgJ21ldGF8Y29udGVudCxodHRwRXF1aXYsbmFtZSxzY2hlbWUnLFxuICAgICAgJ21ldGVyfCNoaWdoLCNsb3csI21heCwjbWluLCNvcHRpbXVtLCN2YWx1ZScsXG4gICAgICAnaW5zLGRlbHxjaXRlLGRhdGVUaW1lJyxcbiAgICAgICdvbHwhY29tcGFjdCwhcmV2ZXJzZWQsI3N0YXJ0LHR5cGUnLFxuICAgICAgJ29iamVjdHxhbGlnbixhcmNoaXZlLGJvcmRlcixjb2RlLGNvZGVCYXNlLGNvZGVUeXBlLGRhdGEsIWRlY2xhcmUsaGVpZ2h0LCNoc3BhY2UsbmFtZSxzdGFuZGJ5LHR5cGUsdXNlTWFwLCN2c3BhY2Usd2lkdGgnLFxuICAgICAgJ29wdGdyb3VwfCFkaXNhYmxlZCxsYWJlbCcsXG4gICAgICAnb3B0aW9ufCFkZWZhdWx0U2VsZWN0ZWQsIWRpc2FibGVkLGxhYmVsLCFzZWxlY3RlZCx0ZXh0LHZhbHVlJyxcbiAgICAgICdvdXRwdXR8ZGVmYXVsdFZhbHVlLCVodG1sRm9yLG5hbWUsdmFsdWUnLFxuICAgICAgJ3B8YWxpZ24nLFxuICAgICAgJ3BhcmFtfG5hbWUsdHlwZSx2YWx1ZSx2YWx1ZVR5cGUnLFxuICAgICAgJ3BpY3R1cmV8JyxcbiAgICAgICdwcmV8I3dpZHRoJyxcbiAgICAgICdwcm9ncmVzc3wjbWF4LCN2YWx1ZScsXG4gICAgICAncSxibG9ja3F1b3RlLGNpdGV8JyxcbiAgICAgICdzY3JpcHR8IWFzeW5jLGNoYXJzZXQsJWNyb3NzT3JpZ2luLCFkZWZlcixldmVudCxodG1sRm9yLGludGVncml0eSxzcmMsdGV4dCx0eXBlJyxcbiAgICAgICdzZWxlY3R8IWF1dG9mb2N1cywhZGlzYWJsZWQsI2xlbmd0aCwhbXVsdGlwbGUsbmFtZSwhcmVxdWlyZWQsI3NlbGVjdGVkSW5kZXgsI3NpemUsdmFsdWUnLFxuICAgICAgJ3NoYWRvd3wnLFxuICAgICAgJ3NvdXJjZXxtZWRpYSxzaXplcyxzcmMsc3Jjc2V0LHR5cGUnLFxuICAgICAgJ3NwYW58JyxcbiAgICAgICdzdHlsZXwhZGlzYWJsZWQsbWVkaWEsdHlwZScsXG4gICAgICAnY2FwdGlvbnxhbGlnbicsXG4gICAgICAndGgsdGR8YWJicixhbGlnbixheGlzLGJnQ29sb3IsY2gsY2hPZmYsI2NvbFNwYW4saGVhZGVycyxoZWlnaHQsIW5vV3JhcCwjcm93U3BhbixzY29wZSx2QWxpZ24sd2lkdGgnLFxuICAgICAgJ2NvbCxjb2xncm91cHxhbGlnbixjaCxjaE9mZiwjc3Bhbix2QWxpZ24sd2lkdGgnLFxuICAgICAgJ3RhYmxlfGFsaWduLGJnQ29sb3IsYm9yZGVyLCVjYXB0aW9uLGNlbGxQYWRkaW5nLGNlbGxTcGFjaW5nLGZyYW1lLHJ1bGVzLHN1bW1hcnksJXRGb290LCV0SGVhZCx3aWR0aCcsXG4gICAgICAndHJ8YWxpZ24sYmdDb2xvcixjaCxjaE9mZix2QWxpZ24nLFxuICAgICAgJ3Rmb290LHRoZWFkLHRib2R5fGFsaWduLGNoLGNoT2ZmLHZBbGlnbicsXG4gICAgICAndGVtcGxhdGV8JyxcbiAgICAgICd0ZXh0YXJlYXxhdXRvY2FwaXRhbGl6ZSwhYXV0b2ZvY3VzLCNjb2xzLGRlZmF1bHRWYWx1ZSxkaXJOYW1lLCFkaXNhYmxlZCwjbWF4TGVuZ3RoLCNtaW5MZW5ndGgsbmFtZSxwbGFjZWhvbGRlciwhcmVhZE9ubHksIXJlcXVpcmVkLCNyb3dzLHNlbGVjdGlvbkRpcmVjdGlvbiwjc2VsZWN0aW9uRW5kLCNzZWxlY3Rpb25TdGFydCx2YWx1ZSx3cmFwJyxcbiAgICAgICd0aXRsZXx0ZXh0JyxcbiAgICAgICd0cmFja3whZGVmYXVsdCxraW5kLGxhYmVsLHNyYyxzcmNsYW5nJyxcbiAgICAgICd1bHwhY29tcGFjdCx0eXBlJyxcbiAgICAgICd1bmtub3dufCcsXG4gICAgICAndmlkZW9ebWVkaWF8I2hlaWdodCxwb3N0ZXIsI3dpZHRoJyxcbiAgICAgICdAc3ZnOmFeQHN2ZzpncmFwaGljc3wnLFxuICAgICAgJ0Bzdmc6YW5pbWF0ZV5Ac3ZnOmFuaW1hdGlvbnwnLFxuICAgICAgJ0Bzdmc6YW5pbWF0ZU1vdGlvbl5Ac3ZnOmFuaW1hdGlvbnwnLFxuICAgICAgJ0Bzdmc6YW5pbWF0ZVRyYW5zZm9ybV5Ac3ZnOmFuaW1hdGlvbnwnLFxuICAgICAgJ0Bzdmc6Y2lyY2xlXkBzdmc6Z2VvbWV0cnl8JyxcbiAgICAgICdAc3ZnOmNsaXBQYXRoXkBzdmc6Z3JhcGhpY3N8JyxcbiAgICAgICdAc3ZnOmN1cnNvcl5Ac3ZnOnwnLFxuICAgICAgJ0Bzdmc6ZGVmc15Ac3ZnOmdyYXBoaWNzfCcsXG4gICAgICAnQHN2ZzpkZXNjXkBzdmc6fCcsXG4gICAgICAnQHN2ZzpkaXNjYXJkXkBzdmc6fCcsXG4gICAgICAnQHN2ZzplbGxpcHNlXkBzdmc6Z2VvbWV0cnl8JyxcbiAgICAgICdAc3ZnOmZlQmxlbmReQHN2Zzp8JyxcbiAgICAgICdAc3ZnOmZlQ29sb3JNYXRyaXheQHN2Zzp8JyxcbiAgICAgICdAc3ZnOmZlQ29tcG9uZW50VHJhbnNmZXJeQHN2Zzp8JyxcbiAgICAgICdAc3ZnOmZlQ29tcG9zaXRlXkBzdmc6fCcsXG4gICAgICAnQHN2ZzpmZUNvbnZvbHZlTWF0cml4XkBzdmc6fCcsXG4gICAgICAnQHN2ZzpmZURpZmZ1c2VMaWdodGluZ15Ac3ZnOnwnLFxuICAgICAgJ0Bzdmc6ZmVEaXNwbGFjZW1lbnRNYXBeQHN2Zzp8JyxcbiAgICAgICdAc3ZnOmZlRGlzdGFudExpZ2h0XkBzdmc6fCcsXG4gICAgICAnQHN2ZzpmZURyb3BTaGFkb3deQHN2Zzp8JyxcbiAgICAgICdAc3ZnOmZlRmxvb2ReQHN2Zzp8JyxcbiAgICAgICdAc3ZnOmZlRnVuY0FeQHN2Zzpjb21wb25lbnRUcmFuc2ZlckZ1bmN0aW9ufCcsXG4gICAgICAnQHN2ZzpmZUZ1bmNCXkBzdmc6Y29tcG9uZW50VHJhbnNmZXJGdW5jdGlvbnwnLFxuICAgICAgJ0Bzdmc6ZmVGdW5jR15Ac3ZnOmNvbXBvbmVudFRyYW5zZmVyRnVuY3Rpb258JyxcbiAgICAgICdAc3ZnOmZlRnVuY1JeQHN2Zzpjb21wb25lbnRUcmFuc2ZlckZ1bmN0aW9ufCcsXG4gICAgICAnQHN2ZzpmZUdhdXNzaWFuQmx1cl5Ac3ZnOnwnLFxuICAgICAgJ0Bzdmc6ZmVJbWFnZV5Ac3ZnOnwnLFxuICAgICAgJ0Bzdmc6ZmVNZXJnZV5Ac3ZnOnwnLFxuICAgICAgJ0Bzdmc6ZmVNZXJnZU5vZGVeQHN2Zzp8JyxcbiAgICAgICdAc3ZnOmZlTW9ycGhvbG9neV5Ac3ZnOnwnLFxuICAgICAgJ0Bzdmc6ZmVPZmZzZXReQHN2Zzp8JyxcbiAgICAgICdAc3ZnOmZlUG9pbnRMaWdodF5Ac3ZnOnwnLFxuICAgICAgJ0Bzdmc6ZmVTcGVjdWxhckxpZ2h0aW5nXkBzdmc6fCcsXG4gICAgICAnQHN2ZzpmZVNwb3RMaWdodF5Ac3ZnOnwnLFxuICAgICAgJ0Bzdmc6ZmVUaWxlXkBzdmc6fCcsXG4gICAgICAnQHN2ZzpmZVR1cmJ1bGVuY2VeQHN2Zzp8JyxcbiAgICAgICdAc3ZnOmZpbHRlcl5Ac3ZnOnwnLFxuICAgICAgJ0Bzdmc6Zm9yZWlnbk9iamVjdF5Ac3ZnOmdyYXBoaWNzfCcsXG4gICAgICAnQHN2ZzpnXkBzdmc6Z3JhcGhpY3N8JyxcbiAgICAgICdAc3ZnOmltYWdlXkBzdmc6Z3JhcGhpY3N8JyxcbiAgICAgICdAc3ZnOmxpbmVeQHN2ZzpnZW9tZXRyeXwnLFxuICAgICAgJ0Bzdmc6bGluZWFyR3JhZGllbnReQHN2ZzpncmFkaWVudHwnLFxuICAgICAgJ0Bzdmc6bXBhdGheQHN2Zzp8JyxcbiAgICAgICdAc3ZnOm1hcmtlcl5Ac3ZnOnwnLFxuICAgICAgJ0Bzdmc6bWFza15Ac3ZnOnwnLFxuICAgICAgJ0Bzdmc6bWV0YWRhdGFeQHN2Zzp8JyxcbiAgICAgICdAc3ZnOnBhdGheQHN2ZzpnZW9tZXRyeXwnLFxuICAgICAgJ0Bzdmc6cGF0dGVybl5Ac3ZnOnwnLFxuICAgICAgJ0Bzdmc6cG9seWdvbl5Ac3ZnOmdlb21ldHJ5fCcsXG4gICAgICAnQHN2Zzpwb2x5bGluZV5Ac3ZnOmdlb21ldHJ5fCcsXG4gICAgICAnQHN2ZzpyYWRpYWxHcmFkaWVudF5Ac3ZnOmdyYWRpZW50fCcsXG4gICAgICAnQHN2ZzpyZWN0XkBzdmc6Z2VvbWV0cnl8JyxcbiAgICAgICdAc3ZnOnN2Z15Ac3ZnOmdyYXBoaWNzfCNjdXJyZW50U2NhbGUsI3pvb21BbmRQYW4nLFxuICAgICAgJ0Bzdmc6c2NyaXB0XkBzdmc6fHR5cGUnLFxuICAgICAgJ0Bzdmc6c2V0XkBzdmc6YW5pbWF0aW9ufCcsXG4gICAgICAnQHN2ZzpzdG9wXkBzdmc6fCcsXG4gICAgICAnQHN2ZzpzdHlsZV5Ac3ZnOnwhZGlzYWJsZWQsbWVkaWEsdGl0bGUsdHlwZScsXG4gICAgICAnQHN2Zzpzd2l0Y2heQHN2ZzpncmFwaGljc3wnLFxuICAgICAgJ0Bzdmc6c3ltYm9sXkBzdmc6fCcsXG4gICAgICAnQHN2Zzp0c3Bhbl5Ac3ZnOnRleHRQb3NpdGlvbmluZ3wnLFxuICAgICAgJ0Bzdmc6dGV4dF5Ac3ZnOnRleHRQb3NpdGlvbmluZ3wnLFxuICAgICAgJ0Bzdmc6dGV4dFBhdGheQHN2Zzp0ZXh0Q29udGVudHwnLFxuICAgICAgJ0Bzdmc6dGl0bGVeQHN2Zzp8JyxcbiAgICAgICdAc3ZnOnVzZV5Ac3ZnOmdyYXBoaWNzfCcsXG4gICAgICAnQHN2Zzp2aWV3XkBzdmc6fCN6b29tQW5kUGFuJ1xuICAgIF0pO1xuXG52YXIgYXR0clRvUHJvcE1hcDoge1tuYW1lOiBzdHJpbmddOiBzdHJpbmd9ID0gPGFueT57XG4gICdjbGFzcyc6ICdjbGFzc05hbWUnLFxuICAnaW5uZXJIdG1sJzogJ2lubmVySFRNTCcsXG4gICdyZWFkb25seSc6ICdyZWFkT25seScsXG4gICd0YWJpbmRleCc6ICd0YWJJbmRleCdcbn07XG5cblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIERvbUVsZW1lbnRTY2hlbWFSZWdpc3RyeSBpbXBsZW1lbnRzIEVsZW1lbnRTY2hlbWFSZWdpc3RyeSB7XG4gIHNjaGVtYSA9IDx7W2VsZW1lbnQ6IHN0cmluZ106IHtbcHJvcGVydHk6IHN0cmluZ106IHN0cmluZ319Pnt9O1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIFNDSEVNQS5mb3JFYWNoKGVuY29kZWRUeXBlID0+IHtcbiAgICAgIHZhciBwYXJ0cyA9IGVuY29kZWRUeXBlLnNwbGl0KCd8Jyk7XG4gICAgICB2YXIgcHJvcGVydGllcyA9IHBhcnRzWzFdLnNwbGl0KCcsJyk7XG4gICAgICB2YXIgdHlwZVBhcnRzID0gKHBhcnRzWzBdICsgJ14nKS5zcGxpdCgnXicpO1xuICAgICAgdmFyIHR5cGVOYW1lID0gdHlwZVBhcnRzWzBdO1xuICAgICAgdmFyIHR5cGUgPSA8e1twcm9wZXJ0eTogc3RyaW5nXTogc3RyaW5nfT57fTtcbiAgICAgIHR5cGVOYW1lLnNwbGl0KCcsJykuZm9yRWFjaCh0YWcgPT4gdGhpcy5zY2hlbWFbdGFnXSA9IHR5cGUpO1xuICAgICAgdmFyIHN1cGVyVHlwZSA9IHRoaXMuc2NoZW1hW3R5cGVQYXJ0c1sxXV07XG4gICAgICBpZiAoaXNQcmVzZW50KHN1cGVyVHlwZSkpIHtcbiAgICAgICAgU3RyaW5nTWFwV3JhcHBlci5mb3JFYWNoKHN1cGVyVHlwZSwgKHYsIGspID0+IHR5cGVba10gPSB2KTtcbiAgICAgIH1cbiAgICAgIHByb3BlcnRpZXMuZm9yRWFjaCgocHJvcGVydHk6IHN0cmluZykgPT4ge1xuICAgICAgICBpZiAocHJvcGVydHkgPT0gJycpIHtcbiAgICAgICAgfSBlbHNlIGlmIChwcm9wZXJ0eS5zdGFydHNXaXRoKCcqJykpIHtcbiAgICAgICAgICAvLyBXZSBkb24ndCB5ZXQgc3VwcG9ydCBldmVudHMuXG4gICAgICAgICAgLy8gdHlwZVtwcm9wZXJ0eS5zdWJzdHJpbmcoMSldID0gRVZFTlQ7XG4gICAgICAgIH0gZWxzZSBpZiAocHJvcGVydHkuc3RhcnRzV2l0aCgnIScpKSB7XG4gICAgICAgICAgdHlwZVtwcm9wZXJ0eS5zdWJzdHJpbmcoMSldID0gQk9PTEVBTjtcbiAgICAgICAgfSBlbHNlIGlmIChwcm9wZXJ0eS5zdGFydHNXaXRoKCcjJykpIHtcbiAgICAgICAgICB0eXBlW3Byb3BlcnR5LnN1YnN0cmluZygxKV0gPSBOVU1CRVI7XG4gICAgICAgIH0gZWxzZSBpZiAocHJvcGVydHkuc3RhcnRzV2l0aCgnJScpKSB7XG4gICAgICAgICAgdHlwZVtwcm9wZXJ0eS5zdWJzdHJpbmcoMSldID0gT0JKRUNUO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHR5cGVbcHJvcGVydHldID0gU1RSSU5HO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIGhhc1Byb3BlcnR5KHRhZ05hbWU6IHN0cmluZywgcHJvcE5hbWU6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIGlmICh0YWdOYW1lLmluZGV4T2YoJy0nKSAhPT0gLTEpIHtcbiAgICAgIC8vIGNhbid0IHRlbGwgbm93IGFzIHdlIGRvbid0IGtub3cgd2hpY2ggcHJvcGVydGllcyBhIGN1c3RvbSBlbGVtZW50IHdpbGwgZ2V0XG4gICAgICAvLyBvbmNlIGl0IGlzIGluc3RhbnRpYXRlZFxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciBlbGVtZW50UHJvcGVydGllcyA9IHRoaXMuc2NoZW1hW3RhZ05hbWUudG9Mb3dlckNhc2UoKV07XG4gICAgICBpZiAoIWlzUHJlc2VudChlbGVtZW50UHJvcGVydGllcykpIHtcbiAgICAgICAgZWxlbWVudFByb3BlcnRpZXMgPSB0aGlzLnNjaGVtYVsndW5rbm93biddO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGlzUHJlc2VudChlbGVtZW50UHJvcGVydGllc1twcm9wTmFtZV0pO1xuICAgIH1cbiAgfVxuXG4gIGdldE1hcHBlZFByb3BOYW1lKHByb3BOYW1lOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHZhciBtYXBwZWRQcm9wTmFtZSA9IFN0cmluZ01hcFdyYXBwZXIuZ2V0KGF0dHJUb1Byb3BNYXAsIHByb3BOYW1lKTtcbiAgICByZXR1cm4gaXNQcmVzZW50KG1hcHBlZFByb3BOYW1lKSA/IG1hcHBlZFByb3BOYW1lIDogcHJvcE5hbWU7XG4gIH1cbn1cbiJdfQ==